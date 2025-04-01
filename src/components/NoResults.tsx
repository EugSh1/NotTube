export default function NoResults() {
    return (
        <div className="flex justify-center items-center w-full h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-semibold">No results found</h2>
                <p className="font-medium">Try different keywords or remove search filters</p>
            </div>
        </div>
    );
}
