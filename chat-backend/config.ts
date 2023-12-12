export const clients: Record<number, { name: string; id: number }> = {
    4200: {
        name: 'Alice Copperson',
        id: 0,
    },
    4201: {
        name: 'Bob Builder',
        id: 1,
    },
    // 4202: {
    //     name: 'Charlie Chaplin',
    //     id: 2,
    // },
}

export const numOfClients = Object.keys(clients).length;