import { configureMulter } from "../config/multerConfig.js";

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const upload = configureMulter(uploadDir);

export const uploadSingle = (fieldName) => upload.single(fieldName);