import {
  Calendar,
  Clock,
  BarChart2,
  Users,
  Trophy,
  MapPin,
  Zap,
  X,
  Search,
  CheckCheck,
} from 'lucide-react'

const FiltersPanel = ({
  showFilters,
  sortBy,
  setSortBy,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
}) => {
  if (!showFilters) return null

  return (
    <div className="filters-panel">
      <div className="filter-section">
        <h3>Trier par</h3>
        <div className="filter-options">
          <button
            className={sortBy === 'recent' ? 'active' : ''}
            onClick={() => setSortBy('recent')}
          >
            <Calendar size={16} />
            <span>Plus récents</span>
          </button>
          <button
            className={sortBy === 'ending-soon' ? 'active' : ''}
            onClick={() => setSortBy('ending-soon')}
          >
            <Clock size={16} />
            <span>Se termine bientôt</span>
          </button>
          <button
            className={sortBy === 'progress' ? 'active' : ''}
            onClick={() => setSortBy('progress')}
          >
            <BarChart2 size={16} />
            <span>Progression</span>
          </button>
          <button
            className={sortBy === 'participants' ? 'active' : ''}
            onClick={() => setSortBy('participants')}
          >
            <Users size={16} />
            <span>Nombre de participants</span>
          </button>
        </div>
      </div>

      <div className="filter-section">
        <h3>Type d'objectif</h3>
        <div className="filter-options">
          <button
            className={filterType === 'all' ? 'active' : ''}
            onClick={() => setFilterType('all')}
          >
            <span>Tous</span>
          </button>
          <button
            className={filterType === 'steps' ? 'active' : ''}
            onClick={() => setFilterType('steps')}
          >
            <Trophy size={16} />
            <span>Pas</span>
          </button>
          <button
            className={filterType === 'distance' ? 'active' : ''}
            onClick={() => setFilterType('distance')}
          >
            <MapPin size={16} />
            <span>Distance</span>
          </button>
          <button
            className={filterType === 'calories' ? 'active' : ''}
            onClick={() => setFilterType('calories')}
          >
            <Zap size={16} />
            <span>Calories</span>
          </button>
          <button
            className={filterType === 'time' ? 'active' : ''}
            onClick={() => setFilterType('time')}
          >
            <Clock size={16} />
            <span>Temps</span>
          </button>
        </div>
      </div>

      <div className="filter-section">
        <h3>Statut</h3>
        <div className="filter-options">
          <button
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            <span>Tous</span>
          </button>
          <button
            className={filterStatus === 'upcoming' ? 'active' : ''}
            onClick={() => setFilterStatus('upcoming')}
          >
            <Calendar size={16} />
            <span>À venir</span>
          </button>
          <button
            className={filterStatus === 'active' ? 'active' : ''}
            onClick={() => setFilterStatus('active')}
          >
            <Zap size={16} />
            <span>En cours</span>
          </button>
          <button
            className={filterStatus === 'completed' ? 'active' : ''}
            onClick={() => setFilterStatus('completed')}
          >
            <CheckCheck size={16} />
            <span>Terminés</span>
          </button>
        </div>
      </div>

      <div className="filter-section">
        <h3>Recherche</h3>
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher un défi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FiltersPanel
