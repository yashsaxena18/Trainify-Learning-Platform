// src/components/search/AdvancedSearch.jsx
const AdvancedSearch = ({ onSearchResults }) => {
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    level: '',
    duration: '',
    price: { min: 0, max: 1000 },
    rating: 0
  });

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          if (key === 'price') {
            params.append('minPrice', value.min);
            params.append('maxPrice', value.max);
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await API.get(`/courses/search?${params}`);
      onSearchResults(response.data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search courses..."
          value={filters.query}
          onChange={(e) => setFilters({...filters, query: e.target.value})}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
        
        <select
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Categories</option>
          <option value="programming">Programming</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
        </select>

        <button
          onClick={handleSearch}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Search
        </button>
      </div>
    </div>
  );
};
