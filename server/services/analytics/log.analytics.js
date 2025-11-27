import logEntry from "../../model/logEntry.js"

// Count attacks per minute
export const getAttacksPerMin = async () => {
    const result = await logEntry.aggregate([
        {
            $match: {isAttack: true}
        },
        {
            $group: {
                _id: {
                    $dateTrunc: {
                        date: "$timestamp",
                        unit: "minute"
                    }
                },
                count: {$sum: 1}
            }
        },
        {
            $sort: {_id: -1} //descending
        }
    ]);
    return result;
}

// Top services
export const topServices = async () => {
    const result = await logEntry.aggregate([
        {
            $group: {
                _id: '$serviceName',
                count: {$sum: 1}
            }
        },
        {
            $sort: {count: -1} // descending
        }
    ])
    return result;
}