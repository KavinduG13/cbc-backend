import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createOrder(req, res) {

    try{
        const user = req.user
        if (user == null) {
            res.status(401).json(
                {
                    message: "Unauthorized user"
                }
            )
            return;
        }

        const orderList = await Order.find().sort({date: -1}).limit(1)   // Order list eka date eke piliwelata sort karanne. Recentma eka udinma
        // limit(1) kiyanne sorted list ekenuth udama thiyena 1 witharak ganna kiyala

        let newOrderID = "CBC0000001"
        if(orderList.length != 0) {     // lenght != 0 kiyanne past orders thiyenawa kiyana eka
            let lastOrderIDInString = orderList[0].orderID  // "CBC0000123"
            let lastOrderNumberInString = lastOrderIDInString.replace("CBC", "")    // "0000123"
            let lastOrderNumber = parseInt(lastOrderNumberInString)     // 123
            let newOrderNumber = lastOrderNumber + 1       // 124
            // padStart - Ilakkam 7kta hadanna, madi thanwalata 0 danna
            let newOrderNumberInString = newOrderNumber.toString().padStart(7, "0")     // "0000124"
            newOrderID = "CBC" + newOrderNumberInString     // "CBC0000124"
        }

        let customerName = req.body.customerName
        if (customerName == null) {
            customerName = user.firstName + " " + user.lastName
        }

        let phone = req.body.phone
        if (phone == null) {
            phone = "Not Provided"
        }

        const itemsInRequest = req.body.items

        if (itemsInRequest == null) {
            res.status(400).json(
                {
                    message: "Items are required to place an order"
                }
            )
            return;
        }

        if (!Array.isArray(itemsInRequest)) {
            res.status(400).json(
                {
                    message: "Items should be an array"
                }
            )
            return;
        }

        const itemsToBeAdded = []
        let total = 0

        for (let i=0; i<itemsInRequest.length; i++) {
            const item = itemsInRequest[i]

            const product = await Product.findOne({productID: item.productID})

            if (product == null) {
                res.status(400).json(
                    {
                        code: "not-found",
                        message: `Product with ID ${item.productID} not found`,
                        productID: item.productID,
                    }
                )
                return;
            }

            if(product.stock < item.quantity) {
                res.status(400).json(
                    {
                        code: "stock",
                        message: `Insufficient stock for product with ID ${item.productID}`,
                        productID: item.productID,
                        availableStock: product.stock, 
                    }
                )
                return;
            }

            itemsToBeAdded.push(
                {
                    productID: product.productID,
                    quantity: item.quantity,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                }
            )

            total += product.price * item.quantity
        }

        const newOrder = new Order(
            {
                orderID: newOrderID,
                items: itemsToBeAdded,
                customerName: customerName,
                email: user.email,
                phone: phone,
                address: req.body.address,
                total: total
            }
        )

        const savedOrder = await newOrder.save()

        // for (let i=0; i<itemsToBeAdded.length; i++) {
        //     const item = itemsToBeAdded[i]
        //     await Product.updateOne(
        //         {productID: item.productID},
        //         {$inc: {stock: -item.quantity}}  // $inc means increment, methanadi adu karanna one nisa - ganakin increment karanwa
        //     )
        // }

        // Or

        // for (let i=0; i<itemsToBeAdded.length; i++) {
        //     const item = itemsToBeAdded[i]

        //     const product = await Product.findOne({productID: item.productID})
        //     const newQty = product.stock - item.quantity

        //     await Product.updateOne(
        //         {productID: item.productID},
        //         {stock: {newQty}}  // $inc means increment, methanadi adu karanna one nisa - ganakin increment karanwa
        //     )

        // Above shown are 2 methods to update the stock after an order confirmation

        res.status(201).json(
            {
                message: "Order created successfully",
                order: savedOrder
            }
        )

    }catch(err) {
        res.status(500).json(
            {
                message: "Internal server error"
            }
        )
    }
}

export async function getOrders(req, res) {
    if (isAdmin(req)) {
        const orders = await Order.find().sort({date:-1})
        res.json(orders)
    }else{
        res.status(403).json(
            {
                message: "You are not authorized to view orders"
            }
        )
    }
}

export async function updateOrderStatus(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json(
            {
                message: "You are not authorized to update order status"
            }
        )
        return;
    }
    const orderID = req.params.orderID
    const newStatus = req.body.status

    try{
        await Order.updateOne(
        {orderID: orderID},
        {status: newStatus}
    )

    res.json(
        {
            message: "Order status updated successfully"
        }
    )

    }catch(err) {
        console.error(err)
        res.status(500).json(
            {
                message: "Failed to update order status"
            }
        )
        return;
    }
}