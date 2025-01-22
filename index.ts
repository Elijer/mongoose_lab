// import { Schema, Types, model, Document } from 'mongoose';
import { getResults } from './models/Result'

import mongoose from 'mongoose'

const dbName = "clasp"

mongoose.connect(`mongodb://localhost:27017/${dbName}`)
getResults()