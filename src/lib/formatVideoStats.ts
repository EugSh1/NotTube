const formatter = new Intl.NumberFormat("en", {
    notation: "compact"
});

export function formatViews(views: number) {
    const compactViews = formatter.format(views);
    return views === 1 ? `${compactViews} view` : `${compactViews} views`;
}

export const formatBigNumber = (num: number) => formatter.format(num);
