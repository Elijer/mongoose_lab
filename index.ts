// import { Schema, Types, model, Document } from 'mongoose';
import { getResults, getTableData } from "./models/getTableData";

import mongoose from "mongoose";

const dbName = "clasp";
const clinicId = "67916e35770af477755dc55d";
mongoose.connect(`mongodb://localhost:27017/${dbName}`);
// await getResults()
const result = await getTableData(clinicId);
console.log(result)
mongoose.connection.close();
