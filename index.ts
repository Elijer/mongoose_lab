// import { Schema, Types, model, Document } from 'mongoose';
import {  getTableData } from "./models/getTableData";
import {  getTableDataAgg } from "./models/getTableDataAgg";

import mongoose from "mongoose";

const dbName = "clasp";
const clinicId = "67916e35770af477755dc55d";
mongoose.connect(`mongodb://localhost:27017/${dbName}`);
// await getResults()
const result = await getTableData(clinicId);
// const result = await getTableDataAgg(clinicId);
console.log(result)
mongoose.connection.close();
