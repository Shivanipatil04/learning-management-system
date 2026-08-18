import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { listCourses, normalizeCourse } from '../../courses/courses.api';
import CourseCard from '../components/courses/CourseCard';
import CourseFilters from '../components/courses/CourseFilters';
import '../styles/browse-courses.css';

const BrowseCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('Most Popular');
  const [filters, setFilters] = useState({ price: '', level: '' });

  const categories = ['All', 'Development', 'Design', 'Business', 'Marketing', 'Other'];
  const sortOptions = ['Most Popular', 'Highest Rated', 'Newest', 'Price: Low to High', 'Price: High to Low'];

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (activeCategory !== 'All') params.append('category', activeCategory);
      if (sort) params.append('sort', sort);
      if (filters.price) params.append('price', filters.price);
      if (filters.level) params.append('level', filters.level);

      const response = await listCourses(Object.fromEntries(params));
      if (response.data.success) {
        const courseData = response.data.data;
        if (!Array.isArray(courseData)) throw new Error('Invalid course list response');
        setCourses(courseData.map(normalizeCourse));
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, sort, filters]);

  // Debounce search slightly
  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  return (
    <div className="browse-courses-page">
      <header className="browse-header">
        <h1>Browse Courses</h1>
        <p>Find the right course and start learning</p>
        
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by course name, skill, or instructor..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="category-tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="browse-content">
        <aside className="filters-sidebar-container">
          <CourseFilters filters={filters} setFilters={setFilters} />
        </aside>
        
        <main className="courses-main">
          <div className="courses-toolbar">
            <span className="results-count">{courses.length} results</span>
            <div className="sort-dropdown">
              <label>Sort by:</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="courses-grid loading">
              {[1, 2, 3, 4].map(n => <div key={n} className="skeleton-card"></div>)}
            </div>
          ) : courses.length > 0 ? (
            <div className="courses-grid">
              {courses.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No courses found matching your criteria.</p>
              <button className="outline-button" onClick={() => {
                setSearch('');
                setActiveCategory('All');
                setFilters({ price: '', level: '' });
              }}>Clear all filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrowseCourses;
