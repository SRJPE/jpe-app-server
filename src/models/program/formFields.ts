import db from '../../db'
import { DropdownOption } from '../../interfaces'
import {
  getOptionsByFormFieldIds,
  insertFormFieldOptions,
  normalizeOptions,
  OPTION_FIELD_TYPES,
} from './formFieldOptions'

const { knex } = db

async function getAllFormFields(): Promise<Array<DropdownOption>> {
  try {
    const formFields = await knex<DropdownOption>('formField').select('*')
    const optionsByFormFieldId = await getOptionsByFormFieldIds(
      formFields.map((field: any) => field.id)
    )

    return formFields.map((field: any) => ({
      ...field,
      options: optionsByFormFieldId[field.id] ?? [],
    }))
  } catch (error) {
    throw error
  }
}

/**
 * Create a form field and (for select types) its options atomically.
 *
 * `options` is not a form_field column — it must be stripped before the insert
 * or Postgres rejects the whole statement.
 *
 * isEnvironmentalField defaults to true: every field created from the dashboard
 * is stored in the generic trap_visit_environmental EAV table, because a
 * non-environmental field would need a dedicated trap_visit column that cannot
 * be created at runtime.
 */
async function postFormField(values): Promise<any> {
  const { options, programId: rawProgramId, program_id, ...rest } =
    values ?? {}
  const programId = rawProgramId ?? program_id ?? null

  // The dashboard posts snake_case; knexSnakeCaseMappers leaves already-snake
  // keys alone, so accept either spelling here.
  const fieldValues: any = { ...rest }
  if (
    fieldValues.isEnvironmentalField === undefined &&
    fieldValues.is_environmental_field === undefined
  ) {
    fieldValues.isEnvironmentalField = true
  }

  const definitions = normalizeOptions(options)

  try {
    return await knex.transaction(async trx => {
      const [created] = await trx('formField').insert(fieldValues, ['*'])

      if (!definitions.length) return { ...created, options: [] }

      if (!OPTION_FIELD_TYPES.includes(created.fieldType)) {
        const error: any = new Error(
          `Options are only valid for ${OPTION_FIELD_TYPES.join(
            ' / '
          )} fields, received "${created.fieldType}".`
        )
        error.status = 400
        throw error
      }

      // Scoped to the creating program by default, NOT global — otherwise
      // any other program that later attaches to this same catalog entry via
      // the "Existing Field" picker would be stuck sharing these exact
      // options, with no way to have their own. See
      // form_field_option_program_scope migration.
      const inserted = await insertFormFieldOptions(
        created.id,
        definitions,
        trx,
        programId
      )

      return { ...created, options: inserted }
    })
  } catch (error) {
    throw error
  }
}

// get form fields options
async function getProgramFormFields(
  programId: string,
  { withOptions = true }: { withOptions?: boolean } = {}
): Promise<Array<DropdownOption>> {
  try {
    const programFormFields = await knex<DropdownOption>('programFields')
      .select(
        'formField.*',
        'programFields.*',
        'unit.definition as unitDefinition',
        'equipment.definition as equipmentDefinition'
      )
      .join('formField', 'formField.id', 'programFields.formFieldId')
      .leftJoin('unit', 'unit.id', 'formField.unitId')
      .leftJoin('equipment', 'equipment.id', 'programFields.equipmentId')
      .where('programFields.programId', programId)

    if (!withOptions) return programFormFields

    // NOTE: group on formFieldId, NOT id. The select above pulls both
    // `formField.*` and `programFields.*`; Postgres returns the last duplicate
    // column, so `row.id` is the program_fields id. Keying options off `row.id`
    // silently hands every field the wrong option set.
    //
    // programId here scopes the merge to THIS program's own options + the
    // shared/global set — never another program's, even if two programs
    // both attached to the same global form_field catalog entry.
    const optionsByFormFieldId = await getOptionsByFormFieldIds(
      programFormFields.map((row: any) => row.formFieldId),
      programId
    )

    return programFormFields.map((row: any) => ({
      ...row,
      options: optionsByFormFieldId[row.formFieldId] ?? [],
    }))
  } catch (error) {
    throw error
  }
}

/**
 * Bulk-renumber order_index for a program's form fields in one transaction.
 * Ownership is re-checked inside the transaction so one program can never
 * reorder another's rows.
 */
async function reorderProgramFormFields({
  programId,
  items,
}: {
  programId: number | string
  items: Array<{ id: any; orderIndex: any }>
}): Promise<Array<DropdownOption>> {
  const cleaned = (items ?? [])
    .map(item => ({
      id: Number(item?.id),
      orderIndex: Number(item?.orderIndex),
    }))
    .filter(
      item => Number.isInteger(item.id) && Number.isInteger(item.orderIndex)
    )

  if (!cleaned.length) {
    const error: any = new Error(
      'items must be a non-empty array of { id, orderIndex }.'
    )
    error.status = 400
    throw error
  }

  try {
    await knex.transaction(async trx => {
      const owned = await trx('programFields')
        .whereIn(
          'id',
          cleaned.map(item => item.id)
        )
        .andWhere('programId', programId)
        .select('id')

      if (owned.length !== cleaned.length) {
        const error: any = new Error(
          'One or more form fields do not belong to this program.'
        )
        error.status = 400
        throw error
      }

      // Single UPDATE ... FROM (VALUES ...). Both values are Number()-coerced
      // above, so the interpolation cannot carry SQL. Raw fragment => snake_case.
      const tuples = cleaned
        .map(item => `(${item.id}, ${item.orderIndex})`)
        .join(',')

      await trx.raw(
        `UPDATE program_fields AS pf
            SET order_index = v.order_index
           FROM (VALUES ${tuples}) AS v(id, order_index)
          WHERE pf.id = v.id AND pf.program_id = ?`,
        [programId]
      )
    })

    // Outside the transaction on purpose: getProgramFormFields uses the
    // module-level knex, so calling it inside would read pre-commit state.
    return await getProgramFormFields(String(programId))
  } catch (error) {
    throw error
  }
}

/**
 * The DB unique index is (program_id, form_field_id, COALESCE(equipment_id, -1)),
 * so a null ("applies to all equipment") row and a specific-equipment row for
 * the SAME form field are different keys as far as Postgres is concerned and
 * can coexist. But the mobile app matches
 * `field.equipmentId === null || field.equipmentId === trapEquipmentType`, so
 * a null row overlaps every specific row and the field would render twice on
 * the same screen. This catches what the unique index can't.
 */
async function assertNoEquipmentScopeConflict({
  trx,
  programId,
  formFieldId,
  equipmentId,
  excludeId,
}: {
  trx: any
  programId: number | string
  formFieldId: number
  equipmentId: number | null
  excludeId?: number | string
}): Promise<void> {
  let query = trx('programFields').where({ programId, formFieldId })
  if (excludeId != null) query = query.andWhereNot('id', excludeId)

  const existing = await query.select('id', 'equipmentId')

  const conflict =
    equipmentId === null
      ? existing.length > 0 // "all equipment" conflicts with ANY existing row
      : existing.some(
          (row: any) =>
            row.equipmentId === null || row.equipmentId === equipmentId
        )

  if (conflict) {
    const error: any = new Error(
      'This form field is already enabled for this program and equipment.'
    )
    error.status = 409
    throw error
  }
}

// values shape: { programId/program_id, formFieldId/form_field_id, equipmentId/equipment_id }
async function postProgramFormField(values): Promise<any> {
  const formFieldId = values.formFieldId ?? values.form_field_id
  const programId = values.programId ?? values.program_id
  const equipmentId =
    values.equipmentId ?? values.equipment_id ?? null

  try {
    return await knex.transaction(async trx => {
      await assertNoEquipmentScopeConflict({
        trx,
        programId,
        formFieldId,
        equipmentId,
      })

      const formField = await trx('formField').where({ id: formFieldId }).first()

      const [programField] = await trx('programFields').insert(
        { ...values, programId, formFieldId, equipmentId },
        ['*']
      )

      const unitDefinition = formField.unitId
        ? await trx('unit')
            .where({ id: formField.unitId })
            .select('definition')
            .first()
            .then((r: any) => r?.definition ?? null)
        : null

      return { ...formField, ...programField, unitDefinition }
    })
  } catch (error) {
    throw error
  }
}

async function updateProgramFormField({ id, updatedValues }): Promise<any> {
  try {
    return await knex.transaction(async trx => {
      // Only re-check the conflict when equipmentId is actually part of this
      // update — most PATCHes here just touch required/formSection/orderIndex.
      const equipmentId =
        updatedValues.equipmentId !== undefined
          ? updatedValues.equipmentId
          : updatedValues.equipment_id !== undefined
            ? updatedValues.equipment_id
            : undefined

      if (equipmentId !== undefined) {
        const current = await trx('programFields').where({ id }).first()
        if (!current) {
          const error: any = new Error('Form field not found.')
          error.status = 404
          throw error
        }
        await assertNoEquipmentScopeConflict({
          trx,
          programId: current.programId,
          formFieldId: current.formFieldId,
          equipmentId,
          excludeId: id,
        })
      }

      const updated = await trx('programFields')
        .where({ id })
        .update(updatedValues, ['*'])
      return updated[0]
    })
  } catch (error) {
    throw error
  }
}

export {
  getAllFormFields,
  postFormField,
  getProgramFormFields,
  postProgramFormField,
  updateProgramFormField,
  reorderProgramFormFields,
}
