import type { AcceptedBuyRequest, BuyRequest, BuyResponse, GetPurchasesResponse, PurchaseEvent } from "@challenge/types"
import { useEffect, useState } from "react"
import { API_URL } from "../config"

const MIN_PRICE = 100
const MAX_PRICE = 1000
const STARTING_PRICE = (MIN_PRICE + MAX_PRICE) / 2
const MAX_CHANGE = 0.02
const userId = '04604a60-1e20-4cb0-9fc4-5b4076fe2cbd'


export const Shop = () => {
    let price = STARTING_PRICE

    const [isLoading, setIsLoading] = useState(false)
    const [displayPrice, setPrice] = useState(price)
    const [buyOrders, setBuyOrders] = useState<AcceptedBuyRequest[]>([])
    const [purchaseHistory, setPurchaseHistory] = useState<PurchaseEvent[]>([])


    // move up to 2% of starting price a second, weighted toward start price. 
    const calcNewPrice = () => {
        const randomNumber = Math.random()
        const weight = price / (STARTING_PRICE * 2)
        const change = STARTING_PRICE * (randomNumber - weight) * MAX_CHANGE
        price += change
        setPrice(price)
    }

    useEffect(() => {
        setInterval(calcNewPrice, 1000)
    }, [])

    const handleBuy = async (price: number) => {
        const data: BuyRequest = {
            username: 'jeff',
            userId,
            time: new Date(),
            price
        }

        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })

            if (response.ok) {
                const responseData: BuyResponse = await response.json()
                setBuyOrders((prev) => [...prev, { ...data, id: responseData.id }])
            }
        } catch (error) {
            console.error('Error making purchase:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGetAllBuys = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/getAllUserBuys/${userId}`)

            if (response.ok) {
                const purchases: GetPurchasesResponse = await response.json()
                console.log(purchases)
                setPurchaseHistory(purchases)
                // remove successful purchases from buy orders after adding them to purchase history.
                console.log(purchases)
                console.log(buyOrders)
                setBuyOrders(orders => orders.filter(order => !purchases.some(purchase => order.id === purchase.id)))
            }
        } catch (error) {
            console.error('Error fetching purchases:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return <div className="h-screen w-full flex items-center justify-center flex-col bg-blue">
        Stock Price:
        <div className="font-bold pl-1">
            {displayPrice.toPrecision(5)}
        </div>
        <div className="">
            <button
                className="p-2 px-3 mx-1 my-2 bg-blue-500 rounded-md"
                onClick={() => { handleBuy(displayPrice) }}
                disabled={isLoading}
            >
                {isLoading ? 'Loading...' : 'Buy'}
            </button>
            <button
                className="p-2 px-3 mx-1 my-2 bg-blue-400 rounded-md"
                onClick={handleGetAllBuys}
                disabled={isLoading}
            >
                Get All Buys
            </button>
        </div>
        <div className="mb-10">
            <label className="font-bold underline">Buy Orders:</label>
            <div className="max-h-30 w-md overflow-auto text-gray-400">
                {buyOrders.map(order =>
                    <div key={order.id}>
                        {order.price.toPrecision(5)} - {order.time.toLocaleTimeString()}
                        {/* <label className="text-xs text-grey-300"> - {order.id}</label> */}
                    </div>
                ).reverse()}
            </div>
        </div>
        <div>
            <label className="font-bold underline">Completed Purchases:</label>
            <div className="max-h-30 w-md overflow-auto text-gray-400">
                {purchaseHistory.map(order =>
                    <div key={order.id}>
                        {order.price.toPrecision(5)} - {new Date(order.timestamp).toLocaleTimeString()}
                    </div>
                ).reverse()}
            </div>
        </div>
    </div>

}