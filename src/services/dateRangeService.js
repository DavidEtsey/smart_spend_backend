const startOfMonth = (date) => {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    );
};

const startOfNextMonth = (date) => {
    return new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        1
    );
};

exports.getDateRange = (period) => {
    const now = new Date();

    switch (period) {
        case "THIS_MONTH":
            return {
                startDate: new Date(now.getFullYear(), now.getMonth(), 1),
                endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                label: now.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric"
                })
            };

        case "LAST_MONTH": {
            const date = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );

            return {
                startDate: date,
                endDate: new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                ),
                label: date.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric"
                })
            };
        }

        case "THIS_YEAR":
            return {
                startDate: new Date(now.getFullYear(), 0, 1),
                endDate: new Date(now.getFullYear() + 1, 0, 1),
                label: `January - December ${now.getFullYear()}`
            };

        case "LAST_YEAR":
            return {
                startDate: new Date(now.getFullYear() - 1, 0, 1),
                endDate: new Date(now.getFullYear(), 0, 1),
                label: `January - December ${now.getFullYear() - 1}`
            };

        case "ALL_TRANSACTIONS":
            return {
                startDate: null,
                endDate: null,
                label: "All Transactions"
            };

        default:
            throw new Error("Invalid period");
    }
};