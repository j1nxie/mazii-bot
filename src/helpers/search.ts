export async function fetchWord(query: string) {
    return fetch("https://mazii.net/api/search/", {
        method: "POST",
        body: JSON.stringify({
            dict: "javi",
            type: "word",
            query: query,
            page: 1,
            limit: 20
        }),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*"
        }
    }).then(rs => rs.json());
}

export async function fetchKanji(query: string) {
    return fetch("https://mazii.net/api/search/", {
        method: "POST",
        body: JSON.stringify({
            dict: "javi",
            type: "kanji",
            query: query,
            page: 1
        }),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*"
        }
    }).then((rs) => rs.json());
}