import express from 'express'
import { createProduct, deleteProduct, getProduct, getProductByID, getProductsBySearch, updateProduct } from '../controllers/productController.js'

const productRouter = express.Router()

productRouter.get("/", getProduct)
productRouter.post("/", createProduct)
productRouter.delete("/:productID", deleteProduct)
productRouter.put("/:productID", updateProduct)
productRouter.get("/search/:query", getProductsBySearch)
productRouter.get("/:productID", getProductByID)

export default productRouter