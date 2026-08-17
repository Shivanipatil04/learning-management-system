import { useState } from 'react';
import { Filter, X } from 'lucide-react';

const CourseFilters = ({ filters, setFilters }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ price: '', level: '', rating: '', language: '' });
  };

  return (
    <>
      <button className="mobile-filter-btn outline-button" onClick={() => setIsOpen(true)}>
        <Filter size={18} /> Filters
      </button>

      <div className={`course-filters-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="filters-header">
          <h3>Filters</h3>
          <button className="icon-button mobile-close" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="filter-group">
          <h4>Price</h4>
          {['All', 'Free', 'Paid'].map(option => (
            <label key={option} className="radio-label">
              <input 
                type="radio" 
                name="price" 
                checked={(filters.price || 'All') === option}
                onChange={() => handleFilterChange('price', option === 'All' ? '' : option)} 
              />
              {option}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <h4>Level</h4>
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map(option => (
            <label key={option} className="radio-label">
              <input 
                type="radio" 
                name="level" 
                checked={(filters.level || 'All') === option}
                onChange={() => handleFilterChange('level', option === 'All' ? '' : option)} 
              />
              {option}
            </label>
          ))}
        </div>

        <button className="text-button clear-filters-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>
      
      {isOpen && <div className="filter-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default CourseFilters;
