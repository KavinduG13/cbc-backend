import Order from "../models/order.js"

export async function createOrder(req, res) {

    // OrderID format - CBC0000001

    // if(req.user == null) {
    //     res.status(401).json(
    //         {
    //             message: "Unauthorized user"
    //         }
    //     )
    //     return
    // }

    try{
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

        const newOrder = new Order(
            {
                orderID: newOrderID,
                items: [],
                customerName: req.body.customerName,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                total: req.body.total,
                status: "pending"
            }
        )

        const savedOrder = await newOrder.save()

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