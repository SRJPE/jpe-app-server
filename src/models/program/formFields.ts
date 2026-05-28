import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

async function getAllFormFields(): Promise<Array<DropdownOption>> {
  try {
    return await knex<DropdownOption>('formField').select('*')
  } catch (error) {
    throw error
  }
}

async function postFormField(values): Promise<any> {
  try {
    const [created] = await knex('formField').insert(values, ['*'])
    return created
  } catch (error) {
    throw error
  }
}

// get form fields options
async function getProgramFormFields(
  programId: string
): Promise<Array<DropdownOption>> {
  try {
    const programFormFields = await knex<DropdownOption>('programFields')
      .select(
        'formField.*',
        'programFields.*',
        'unit.definition as unitDefinition'
      )
      .join('formField', 'formField.id', 'programFields.formFieldId')
      .leftJoin('unit', 'unit.id', 'formField.unitId')
      .where('programFields.programId', programId)

    return programFormFields
  } catch (error) {
    throw error
  }
}

// values shape: { programId/program_id, formFieldId/form_field_id }
async function postProgramFormField(values): Promise<any> {
  const formFieldId = values.formFieldId ?? values.form_field_id
  const programId = values.programId ?? values.program_id
  try {
    const formField = await knex('formField').where({ id: formFieldId }).first()

    const [programField] = await knex('programFields').insert(
      { ...values, programId, formFieldId },
      ['*']
    )

    const unitDefinition = formField.unitId
      ? await knex('unit')
          .where({ id: formField.unitId })
          .select('definition')
          .first()
          .then(r => r?.definition ?? null)
      : null

    return { ...formField, ...programField, unitDefinition }
  } catch (error) {
    throw error
  }
}

async function updateProgramFormField({ id, updatedValues }): Promise<any> {
  try {
    const updated = await knex('programFields')
      .where({ id })
      .update(updatedValues, ['*'])
    return updated[0]
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
}
