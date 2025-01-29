import { Schema, SchemaTypes, model, Types} from "mongoose";

const ResultSchema = new Schema({
  clinic_id: { type: SchemaTypes.ObjectId, required: true },
  patient_id: { type: Number, required: true },
  field_nm: { type: String, required: true },
  field_value: { type: String, required: true },
});

const ResultModel = model("results", ResultSchema);

interface FieldResult {
  field_nm: string,
  field_value: string
}

interface DBResult {
  _id: number,
  fields: FieldResult[]
}

type Row = (string | number)[]

export async function getTableDataAgg2(clinicId: string, patientId: number | null = null): Promise<string> {

  const matchStage = {
    $match: {
      clinic_id: castAsObjectId(clinicId), // necessary fix for known issue: https://github.com/Automattic/mongoose/issues/1399
      field_nm: { $ne: '', $exists: true },
      field_value: { $ne: '', $exists: true },
      ...patientId ? {patient_id: patientId} : {}
    }
  }

  const dbResult: DBResult[] = await ResultModel.aggregate([
    matchStage,
    {
      $group: {
        _id: '$patient_id',
        fields: { $push: {
          field_nm: '$field_nm',
          field_value: '$field_value' } }
      }
    }
  ]).exec();


  return transformAggregationResultToJSONTable(dbResult)
}

function transformAggregationResultToJSONTable(results: DBResult[]): string {

  const fieldNmKey = {
    "name": 1,
    "nickname": 2,
    "msk concern": 3
  }

  const fieldNmSpace = Object.keys(fieldNmKey).length
  const emptyVal = "---"

  const tableData: Row[] = []

  try {

    for (let result of results){
      const emptySlots = Array.from({length: fieldNmSpace}, ()=>emptyVal)
      const { fields, _id: patientId} = result
      const row: Row = [patientId, ...emptySlots]
      for (const {field_nm: name, field_value: value} of fields){
        const col = fieldNmKey[name]
        if (col) row[col] = value
      }
      tableData.push(row)
    }
    
    return JSON.stringify(tableData, null, 2);
  } catch (e){
    throw new Error(`Problem transforming table aggregate ${e}`)
  }
}

function castAsObjectId(id: string){
  try {
    return new Types.ObjectId(id)
  } catch(e){
    throw new Error(`Couldn't build mongo ObjectId for id ${id}: ${e}`)
  }
}