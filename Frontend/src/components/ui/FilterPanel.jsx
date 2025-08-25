const FilterPanel = ({ activeFilter, onFilterChange, filters, variant = 'default' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${
      variant === 'category' ? 'justify-center' : ''
    }`}>
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeFilter === filter.id
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterPanel;