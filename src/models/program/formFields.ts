import db from '../../db'
import { DropdownOption } from '../../interfaces'

const { knex } = db

// get funding Agency options
async function getProgramFormFields(
  programId: 'string'
): Promise<Array<DropdownOption>> {
  try {
    const programFormFields = await knex<DropdownOption>('programFields')
      .select(
        'programFields.*',
        'formField.*',
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

export { getProgramFormFields }
