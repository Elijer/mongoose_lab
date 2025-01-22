import { Schema, SchemaTypes, model } from "mongoose";

const ResultSchema = new Schema({
  clinic_id: SchemaTypes.ObjectId, // This is a "foreign key" to Clinic collection
  patient_id: Number, // This is a "foreign key" to Patient collection
  field_nm: String,
  field_value: String
});

const ResultModel = model('results', ResultSchema);

export async function getResults(){
  try {
    const result = await ResultModel.find({}).exec();
    console.log(result)
  } catch(e){
    console.error(e)
  }
}

// async function getTableData(clinicId) {
//   // part 1
//   const dpList = await ResultModel.find({ clinic_id: clinicId }).exec();

//   // part 2
//   const dynamicList = [];
//   let rowMap;
//   let prevRowId = -1;
//   for (const dp of dpList) {
//     if (dp.patient_id !== prevRowId) {
//       rowMap = new Map();
//       dynamicList.push(rowMap);
//     }
//     prevRowId = dp.patient_id;

//     rowMap.set(dp.field_nm, dp.field_value);
//   }

//   return dynamicList;
// }

// console.log(getTableData())