import { Schema, SchemaTypes, model, Types} from "mongoose";

const ResultSchema = new Schema({
  clinic_id: { type: SchemaTypes.ObjectId, required: true },
  patient_id: { type: Number, required: true },
  field_nm: { type: String, required: true },
  field_value: { type: String, required: true },
});

const ResultModel = model("results", ResultSchema);

interface DBResult {
  _id: number,
  field_nms: string[],
  field_values: string[]
}

export async function getTableDataAgg(clinicId: string, patientId: number | null = null): Promise<string> {

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
        field_nms: { $push: '$field_nm' },
        field_values: { $push: '$field_value' }
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

  const fieldNmKeys = Object.keys(fieldNmKey)
  const fieldNmSpace = fieldNmKeys.length
  const emptyVal = "---"

  const tableData: (string | number )[][] = []

  for (let result of results){
    const { field_nms: names, field_values: values, _id: patientId} = result
    const emptySlots = Array.from({length: fieldNmSpace}, ()=>emptyVal)
    const i = tableData.push([patientId, ...emptySlots]) - 1
    for (const j in names){
      const name = names[j]
      if (Object.keys(fieldNmKey).includes(name)){
        const fieldTableCol = fieldNmKey[name]
        tableData[i][fieldTableCol] = values[j]
      }
    }
  }

  return JSON.stringify(tableData, null, 2);
}

function castAsObjectId(id: string){
  return new Types.ObjectId(id)
}