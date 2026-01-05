import logEntry from "../../model/logEntry.js"

// Count attacks per minute
export const getAttacksPerMin = async () => {
    const result = await logEntry.aggregate([
        {
            $match: { isAttack: true }
        },
        {
            $group: {
                _id: {
                    $dateTrunc: {
                        date: "$timestamp",
                        unit: "minute"
                    }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: -1 } //descending
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
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 } // descending
        }
    ])
    return result;
}

export const getCountOfLogs = async () => {
    const count = await logEntry.countDocuments();
    return count;
}

export const getAttackIps = async () => {
    const totalAttackIps = await logEntry.distinct("meta.ip", {
        isAttack: true
    });

    return totalAttackIps;
}

export const avgResTime = async () => {
    const avgResponse = await logEntry.aggregate([
        { $group: { _id: null, avg: { $avg: "$meta.responseTime" } } }
    ]);
    return avgResponse;
}

export const getAttackDetails = async () => {
    const attackDetails = await logEntry.aggregate([
        { $match: { isAttack: true } },
        {
            $group: {
                _id: "$meta.ip",
                reasons: { $addToSet: "$attackReasons" }
            }
        },
        {
            $project: {
                _id: 0,
                ip: "$_id",
                isAttack: { $literal: true },
                reasons: {
                    $reduce: {
                        input: "$reasons",
                        initialValue: [],
                        in: { $setUnion: ["$$value", "$$this"] }
                    }
                }
            }
        }
    ]);

    return attackDetails;
}