import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
// Context
import { useRewards } from "../hooks/useRewards";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import GlobalLoader from "../utils/GlobalLoader";
// Icons & charts
import {
  Icon,
  Footprints,
  Spline,
  Watch,
  Dumbbell,
  CircleGauge,
  Trophy,
  Medal,
  Star,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Award,
  Target,
  Zap,
  Users,
  Info,
  X,
  ArrowUp,
  BarChart2,
  Flame,
  Gift,
  Crown,
  Bookmark,
  BookmarkPlus,
  Share2,
  Sparkles,
  BadgeInfo,
  LucideAward,
  ThumbsUp,
} from "lucide-react";
import { sneaker, watchActivity } from "@lucide/lab";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
// CSS
import "./Rewards.css";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Rewards = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState({
    type: "all",
    tier: "all",
    status: "all",
    search: "",
  });
  const [sortBy, setSortBy] = useState("progress");
  const [showFilters, setShowFilters] = useState(false);
  const [rewardStats, setRewardStats] = useState({
    total: 0,
    unlocked: 0,
    percentage: 0,
    byType: {},
    byTier: {},
    recentlyUnlocked: null,
    nextToUnlock: null,
  });
  const [noir, setNoir] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [animateReward, setAnimateReward] = useState(null);
  const confettiRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the real rewards hook
  const {
    rewards,
    myRewards,
    vitrine,
    fetchRewards,
    fetchMyRewards,
    fetchVitrineRewards,
    setInVitrine,
  } = useRewards(user?._id);

  // modal close handler
  const RewardModalRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowRewardModal(false);
      setSelectedReward(null);
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      background: theme === "dark" ? "#333" : "white",
      color: theme === "dark" ? "white" : "black",
      borderColor: state.isFocused
        ? "#80bdff"
        : theme === "dark"
        ? "#555"
        : "#ccc",
      boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(0,123,255,.25)" : null,
      "&:hover": {
        borderColor: state.isFocused ? "#80bdff" : "#aaa",
      },
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: theme === "dark" ? "white" : "black",
    }),
    menu: (provided, state) => ({
      ...provided,
      background: theme === "dark" ? "#333" : "white",
      color: theme === "dark" ? "white" : "black",
    }),
    option: (provided, state) => ({
      ...provided,
      background: state.isFocused
        ? "#007bff"
        : theme === "dark"
        ? "#333"
        : "white",
      color: state.isFocused ? "white" : theme === "dark" ? "white" : "black",
      "&:hover": {
        background: "#007bff",
        color: "white",
      },
    }),
  };

  useEffect(() => {
    const fetchAll = async () => {
      if (user?._id) {
        await fetchRewards();
        await fetchMyRewards();
        await fetchVitrineRewards();
      }
      setIsLoading(false);
    };
    fetchAll();
  }, [user?._id, fetchRewards, fetchMyRewards, fetchVitrineRewards]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setNoir(getCssVar("--Noir"));
    }, 0);
    return () => clearTimeout(timeout);
  }, [theme]);

  function getCssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        () => {
          setShowRewardModal(false);
          setSelectedReward(null);
        };
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setShowRewardModal, setSelectedReward]);

  // Process rewards data when it changes
  useEffect(() => {
    if (rewards.length > 0 && myRewards.length > 0) {
      // Create a lookup map for faster access
      const myRewardsMap = new Map();

      // Process myRewards data to create a map of unlocked rewards
      myRewards.forEach((item) => {
        if (item.rewardId && item.progress) {
          myRewardsMap.set(item.rewardId._id || item.rewardId.id, {
            progress: item.progress,
            unlockedAt: item.unlockedAt,
            unlocked: item.progress === 100,
          });
        }
      });

      // Create user rewards array with processed data
      const userRewards = rewards.map((reward) => {
        const myReward = myRewardsMap.get(reward._id || reward.id);

        return {
          ...reward,
          progress: myReward ? myReward.progress : 0,
          unlocked: myReward ? myReward.progress === 100 : false,
          unlockedAt: myReward ? myReward.unlockedAt : null,
          unlockedPercentage:
            Math.round(Math.random() * 80) +
            (reward.tier === "bronze"
              ? 10
              : reward.tier === "silver"
              ? 5
              : reward.tier === "gold"
              ? 3
              : reward.tier === "platinum"
              ? 2
              : 1),
        };
      });

      // Calculate stats
      calculateRewardStats(rewards, userRewards);
    }
  }, [rewards, myRewards]);

  // Calculate reward statistics
  const calculateRewardStats = (allRewards, userRewards) => {
    const total = allRewards.length;
    const unlocked = userRewards.filter((r) => r.unlocked).length;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    // Group by type
    const byType = {};
    const byTier = {};

    // Initialize counters for all criteria types and tiers
    const criteriaTypes = [
      "steps",
      "steps-time",
      "distance",
      "distance-time",
      "calories",
      "calories-time",
      "streak",
      "level",
      "customgoal",
      "challenges",
      "challenges-time",
      "rank",
      "friend",
    ];

    const tierTypes = [
      "bronze",
      "silver",
      "gold",
      "platinum",
      "ruby",
      "sapphire",
      "diamond",
    ];

    criteriaTypes.forEach((criteria) => {
      byType[criteria] = { total: 0, unlocked: 0 };
    });

    tierTypes.forEach((tier) => {
      byTier[tier] = { total: 0, unlocked: 0 };
    });

    // Count the rewards by type and tier
    allRewards.forEach((reward) => {
      // Count by type
      if (byType[reward.criteria]) {
        byType[reward.criteria].total += 1;
      }

      // Count by tier
      if (byTier[reward.tier]) {
        byTier[reward.tier].total += 1;
      }
    });

    // Count unlocked rewards
    userRewards.forEach((reward) => {
      if (reward.unlocked) {
        if (byType[reward.criteria]) {
          byType[reward.criteria].unlocked += 1;
        }

        if (byTier[reward.tier]) {
          byTier[reward.tier].unlocked += 1;
        }
      }
    });

    // Find recently unlocked reward
    const recentlyUnlocked = userRewards
      .filter((r) => r.unlocked)
      .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))[0];

    // Find next reward to unlock (closest to completion (progress > 20%))
    const nextToUnlock = userRewards
      .filter((r) => !r.unlocked && r.progress > 20)
      .sort((a, b) => b.progress - a.progress)[0];

    setRewardStats({
      total,
      unlocked,
      percentage,
      byType,
      byTier,
      recentlyUnlocked,
      nextToUnlock,
    });
  };

  // Filter rewards based on current filters
  const filteredRewards = () => {
    // If rewards aren't loaded yet, return empty array
    if (!rewards || rewards.length === 0) return [];

    // Get all rewards with their unlock status
    const allUserRewards = rewards.map((reward) => {
      const myReward = myRewards.find(
        (r) => (r.rewardId._id || r.rewardId.id) === (reward._id || reward.id)
      );

      return {
        ...reward,
        progress: myReward ? myReward.progress : 0,
        unlocked: myReward ? myReward.progress === 100 : false,
        unlockedAt: myReward ? myReward.unlockedAt : null,
        unlockedPercentage:
          Math.round(Math.random() * 80) +
          (reward.tier === "bronze" ? 10 : reward.tier === "silver" ? 5 : 3),
      };
    });

    return allUserRewards.filter((reward) => {
      // Filter by search
      const nameMatch =
        reward.name &&
        (reward.name[user?.languagePreference]
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
          reward.name.en.toLowerCase().includes(filters.search.toLowerCase()));
      const descMatch =
        reward.description &&
        (reward.description[user?.languagePreference]
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
          reward.description.en
            .toLowerCase()
            .includes(filters.search.toLowerCase()));

      if (filters.search && !nameMatch && !descMatch) {
        return false;
      }

      // Filter by type
      if (filters.type !== "all" && reward.criteria !== filters.type) {
        return false;
      }

      // Filter by tier
      if (filters.tier !== "all" && reward.tier !== filters.tier) {
        return false;
      }

      // Filter by status
      if (filters.status === "unlocked" && !reward.unlocked) {
        return false;
      }
      if (filters.status === "locked" && reward.unlocked) {
        return false;
      }

      return true;
    });
  };

  // Sort filtered rewards
  const sortedRewards = () => {
    const filtered = filteredRewards();

    switch (sortBy) {
      case "name":
        return filtered.sort((a, b) => {
          const nameA = a.name[user?.languagePreference] || a.name?.en || "";
          const nameB = b.name[user?.languagePreference] || b.name?.en || "";
          return nameA.localeCompare(nameB);
        });
      case "progress":
        return filtered.sort((a, b) => {
          // Unlocked rewards first, then by progress
          if (a.unlocked && !b.unlocked) return -1;
          if (!a.unlocked && b.unlocked) return 1;
          return b.progress - a.progress;
        });
      case "tier":
        const tierOrder = {
          bronze: 1,
          silver: 2,
          gold: 3,
          platinum: 4,
          ruby: 5,
          sapphire: 6,
          diamond: 7,
        };
        return filtered.sort((a, b) => tierOrder[b.tier] - tierOrder[a.tier]);
      case "date":
        return filtered.sort((a, b) => {
          if (!a.unlocked && !b.unlocked) return b.progress - a.progress;
          if (!a.unlocked) return 1;
          if (!b.unlocked) return -1;
          return new Date(b.unlockedAt) - new Date(a.unlockedAt);
        });
      case "rarity":
        return filtered.sort(
          (a, b) => a.unlockedPercentage - b.unlockedPercentage
        );
      default:
        return filtered;
    }
  };

  // Handle reward click
  const handleRewardClick = (reward) => {
    setSelectedReward(reward);
    setShowRewardModal(true);
  };

  // Handle adding/removing reward from vitrine
  const handleToggleShowcase = async (reward) => {
    setIsLoading(true);
    try {
      await setInVitrine(reward._id);
    } catch (error) {
      console.error("Error seting vitrine:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reward animation
  const triggerRewardAnimation = (reward) => {
    setAnimateReward(reward);
    setTimeout(() => {
      setAnimateReward(null);
    }, 3000);
  };

  // Get criteria label
  const getCriteriaLabel = (criteria) => {
    switch (criteria) {
      case "steps":
        return "Pas";
      case "steps-time":
        return "Pas (Temps)";
      case "distance":
        return "Distance";
      case "distance-time":
        return "Distance (Temps)";
      case "calories":
        return "Calories";
      case "calories-time":
        return "Calories (Temps)";
      case "streak":
        return "Streak";
      case "level":
        return "Niveau";
      case "customgoal":
        return "Objectif personnalisé";
      case "challenges":
        return "Défis";
      case "challenges-time":
        return "Défis (Temps)";
      case "rank":
        return "Classement";
      case "friend":
        return "Social";
      default:
        return criteria;
    }
  };

  // Get criteria icon
  const getCriteriaIcon = (criteria) => {
    switch (criteria) {
      case "steps":
        return <Footprints size={16} />;
      case "steps-time":
        return <Icon iconNode={sneaker} size={16} />;
      case "distance":
        return <Spline size={16} />;
      case "distance-time":
        return <Watch size={16} />;
      case "calories":
        return <Flame size={16} />;
      case "calories-time":
        return <Icon iconNode={watchActivity} size={16} />;
      case "streak":
        return <Zap size={16} />;
      case "level":
        return <Star size={16} />;
      case "customgoal":
        return <Target size={16} />;
      case "challenges":
        return <Dumbbell size={16} />;
      case "challenges-time":
        return <CircleGauge size={16} />;
      case "rank":
        return <Crown size={16} />;
      case "friend":
        return <Users size={16} />;
      default:
        return <Medal size={16} />;
    }
  };

  // Get tier color class
  const getTierColorClass = (tier) => {
    switch (tier) {
      case "bronze":
        return "tier-bronze";
      case "silver":
        return "tier-silver";
      case "gold":
        return "tier-gold";
      case "platinum":
        return "tier-platinum";
      case "ruby":
        return "tier-ruby";
      case "sapphire":
        return "tier-sapphire";
      case "diamond":
        return "tier-diamond";
      default:
        return "";
    }
  };

  // Get tier label
  const getTierLabel = (tier) => {
    switch (tier) {
      case "bronze":
        return "Bronze";
      case "silver":
        return "Argent";
      case "gold":
        return "Or";
      case "platinum":
        return "Platine";
      case "ruby":
        return "Rubis";
      case "sapphire":
        return "Saphir";
      case "diamond":
        return "Diamant";
      default:
        return tier;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Generate monthly rewards data
  const generateMonthlyRewardsData = () => {
    // If no unlocked rewards, return empty data
    if (!myRewards || myRewards.length === 0) {
      return Array(12).fill(0);
    }

    // Count rewards unlocked per month
    const monthlyData = Array(12).fill(0);

    myRewards.forEach((reward) => {
      if (reward.progress === 100 && reward.unlockedAt) {
        const month = new Date(reward.unlockedAt).getMonth();
        monthlyData[month]++;
      }
    });

    return monthlyData;
  };

  // Get empty dashboard content
  const getEmptyDashboardContent = () => {
    return (
      <div className="rewards-dashboard empty-rewards">
        <div className="empty-rewards-container">
          <div className="empty-rewards-icon">
            <Medal size={64} />
          </div>
          <h3>Pas encore de récompenses</h3>
          <p>
            Vous n'avez pas encore débloqué de récompenses. Commencez à
            atteindre vos objectifs pour gagner des badges et des récompenses !
          </p>

          <div className="empty-rewards-tips">
            <h4>Comment gagner des récompenses :</h4>
            <ul>
              <li>
                <Trophy size={16} />
                <span>Atteignez votre objectif quotidien de pas</span>
              </li>
              <li>
                <Flame size={16} />
                <span>Brûlez des calories en marchant ou en courant</span>
              </li>
              <li>
                <Award size={16} />
                <span>Parcourez différentes distances</span>
              </li>
              <li>
                <Zap size={16} />
                <span>Maintenez une série d'activités consécutives</span>
              </li>
              <li>
                <Gift size={16} />
                <span>Participez à des défis communautaires</span>
              </li>
            </ul>
          </div>

          <Link to="/challenges" className="empty-rewards-action">
            <Gift size={16} />
            Découvrir les défis disponibles
          </Link>
        </div>
      </div>
    );
  };

  // Get empty catalog content
  const getEmptyCatalogContent = () => {
    return (
      <div className="rewards-catalog">
        <div className="catalog-header">
          <div className="catalog-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Rechercher une récompense..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <div className="catalog-actions">
            <div className="catalog-sort">
              <label>Trier par:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                styles={customSelectStyles}
              >
                <option value="progress">Progression</option>
                <option value="name">Nom</option>
                <option value="tier">Niveau</option>
                <option value="date">Date d'obtention</option>
                <option value="rarity">Rareté</option>
              </select>
            </div>

            <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span>Filtres</span>
              {showFilters ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="catalog-filters">
            <div className="filter-group">
              <label>Type</label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                styles={customSelectStyles}
              >
                <option value="all">Tous les types</option>
                <option value="steps">Pas</option>
                <option value="steps-time">Pas (Temps)</option>
                <option value="distance">Distance</option>
                <option value="distance-time">Distance (Temps)</option>
                <option value="calories">Calories</option>
                <option value="calories-time">Calories (Temps)</option>
                <option value="streak">Streak</option>
                <option value="level">Niveau</option>
                <option value="customgoal">Objectif personnalisé</option>
                <option value="challenges">Défis</option>
                <option value="challenges-time">Défis (Temps)</option>
                <option value="rank">Classement</option>
                <option value="friend">Social</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Niveau</label>
              <select
                value={filters.tier}
                onChange={(e) =>
                  setFilters({ ...filters, tier: e.target.value })
                }
                styles={customSelectStyles}
              >
                <option value="all">Tous les niveaux</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Argent</option>
                <option value="gold">Or</option>
                <option value="platinum">Platine</option>
                <option value="ruby">Rubis</option>
                <option value="sapphire">Saphir</option>
                <option value="diamond">Diamant</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Statut</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                styles={customSelectStyles}
              >
                <option value="all">Tous</option>
                <option value="unlocked">Débloqués</option>
                <option value="locked">Non débloqués</option>
              </select>
            </div>
          </div>
        )}

        <div className="empty-catalog-grid">
          <div className="empty-catalog-content">
            <div className="empty-catalog-icon">
              <Sparkles size={64} />
            </div>
            <h3>Explorez les récompenses à débloquer</h3>
            <p>
              Découvrez toutes les récompenses que vous pouvez obtenir en
              relevant des défis et en atteignant vos objectifs.
            </p>

            <div className="rewards-preview">
              <h4>Quelques récompenses à découvrir :</h4>
              <div className="rewards-preview-grid">
                {rewards.slice(0, 3).map((reward, index) => (
                  <div
                    key={index}
                    className={`reward-preview-card ${getTierColorClass(
                      reward.tier
                    )}`}
                  >
                    <div className="reward-preview-icon">
                      <img
                        src={
                          reward.iconUrl ||
                          "/placeholder.svg?height=100&width=100&text=🏆"
                        }
                        alt={
                          reward.name[user?.languagePreference] || "Récompense"
                        }
                      />
                    </div>
                    <div className="reward-preview-info">
                      <h5>
                        {reward.name[user?.languagePreference] ||
                          reward.name[user?.languagePreference] ||
                          "Récompense"}
                      </h5>
                      <p>
                        {reward.description[user?.languagePreference] ||
                          reward.description?.en ||
                          "Complétez des objectifs pour débloquer cette récompense."}
                      </p>
                      <span className="reward-preview-tier">
                        {getTierLabel(reward.tier)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get empty showcase content
  const getEmptyShowcaseContent = () => {
    return (
      <div className="rewards-showcase">
        <div className="showcase-header">
          <h2>Ma Vitrine de Récompenses</h2>
          <p>Débloque des récompenses pour les mettre en avant ici</p>
        </div>

        <div className="empty-showcase-container">
          <div className="empty-showcase-icon">
            <LucideAward size={64} />
          </div>
          <h3>Votre vitrine est vide</h3>
          <p>
            Débloque des récompenses en réalisant des objectifs pour les mettre
            en avant dans ta vitrine personnelle !
          </p>

          <div className="empty-showcase-tips">
            <h4>Comment créer votre vitrine :</h4>
            <ul>
              <li>
                <ThumbsUp size={16} />
                <span>
                  Débloque des récompenses en atteignant tes objectifs
                </span>
              </li>
              <li>
                <BookmarkPlus size={16} />
                <span>Ajoute jusqu'à 3 récompenses à ta vitrine</span>
              </li>
              <li>
                <BadgeInfo size={16} />
                <span>
                  Les récompenses les plus rares impressionneront tes amis
                </span>
              </li>
            </ul>
          </div>

          <button
            className="empty-showcase-action"
            onClick={() => setActiveTab("catalog")}
          >
            <Medal size={16} />
            Explorer les récompenses disponibles
          </button>
        </div>
      </div>
    );
  };

  // Get dashboard content
  const getDashboardContent = () => {
    // If there are no unlocked rewards, show empty dashboard
    if (!myRewards || rewardStats.unlocked === 0) {
      return getEmptyDashboardContent();
    }

    // Chart data for criteria summary
    const criteriaChartData = {
      labels: Object.entries(rewardStats.byType).map(([criteria]) =>
        getCriteriaLabel(criteria)
      ),
      datasets: [
        {
          label: "Récompenses",
          data: Object.entries(rewardStats.byType).map(
            ([, stats]) => stats.unlocked
          ),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    };

    // Chart data for tier summary
    const tierChartData = {
      labels: Object.entries(rewardStats.byTier).map(([tier]) =>
        getTierLabel(tier)
      ),
      datasets: [
        {
          label: "Récompenses",
          data: Object.entries(rewardStats.byTier).map(
            ([, stats]) => stats.unlocked
          ),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(128, 0, 128, 0.6)", // Purple for diamond
          ],
          borderWidth: 1,
        },
      ],
    };

    // Chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: false,
        },
      },
    };

    return (
      <div className="rewards-dashboard">
        <div className="dashboard-header">
          <div className="dashboard-progress">
            <div className="progress-info">
              <h3>Progression globale</h3>
              <span className="progress-percentage">
                {rewardStats.percentage}%
              </span>
            </div>
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${rewardStats.percentage}%` }}
              ></div>
            </div>
            <div className="progress-detail">
              <span>
                {rewardStats.unlocked} / {rewardStats.total} récompenses
                débloquées
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-summary">
          <div className="summary-section">
            <h3>Résumé par critère</h3>
            <div className="criteria-summary">
              {Object.entries(rewardStats.byType)
                .filter(([_, stats]) => stats.total > 0)
                .map(([criteria, stats]) => (
                  <div className="criteria-item" key={criteria}>
                    <div className="criteria-icon">
                      {getCriteriaIcon(criteria)}
                    </div>
                    <div className="criteria-info">
                      <span className="criteria-name">
                        {getCriteriaLabel(criteria)}
                      </span>
                      <div className="criteria-progress">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.round(
                              (stats.unlocked / stats.total) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="criteria-stats">
                        {stats.unlocked} / {stats.total}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="summary-section">
            <h3>Résumé par niveau</h3>
            <div className="tier-summary">
              {Object.entries(rewardStats.byTier)
                .filter(([_, stats]) => stats.total > 0)
                .map(([tier, stats]) => (
                  <div className="tier-item" key={tier}>
                    <div className={`tier-icon ${getTierColorClass(tier)}`}>
                      <Medal size={16} />
                    </div>
                    <div className="tier-info">
                      <span className="tier-name">{getTierLabel(tier)}</span>
                      <div className="tier-progress">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.round(
                              (stats.unlocked / stats.total) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="tier-stats">
                        {stats.unlocked} / {stats.total}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="dashboard-highlights">
          {rewardStats.recentlyUnlocked && (
            <div className="highlight-card recent-reward">
              <div className="highlight-header">
                <h3>Dernière récompense débloquée</h3>
                <span className="highlight-date">
                  {formatDate(rewardStats.recentlyUnlocked.unlockedAt)}
                </span>
              </div>
              <div className="highlight-content">
                <div className="highlight-icon">
                  <img
                    src={
                      rewardStats.recentlyUnlocked.iconUrl ||
                      "/placeholder.svg?height=100&width=100&text=🏆"
                    }
                    alt={
                      rewardStats.recentlyUnlocked.name[
                        user?.languagePreference
                      ] || "Récompense"
                    }
                  />
                </div>
                <div className="highlight-info">
                  <h4 className="highlight-name">
                    {rewardStats.recentlyUnlocked.name[
                      user?.languagePreference
                    ] ||
                      rewardStats.recentlyUnlocked.name?.en ||
                      "Récompense"}
                  </h4>
                  <p className="highlight-description">
                    {rewardStats.recentlyUnlocked.description[
                      user?.languagePreference
                    ] ||
                      rewardStats.recentlyUnlocked.description?.en ||
                      "Description de la récompense"}
                  </p>
                  <div className="highlight-meta">
                    <span
                      className={`highlight-tier ${getTierColorClass(
                        rewardStats.recentlyUnlocked.tier
                      )}`}
                    >
                      {getTierLabel(rewardStats.recentlyUnlocked.tier)}
                    </span>
                    <span className="highlight-criteria">
                      {getCriteriaIcon(rewardStats.recentlyUnlocked.criteria)}
                      {getCriteriaLabel(rewardStats.recentlyUnlocked.criteria)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="highlight-action"
                onClick={() => handleRewardClick(rewardStats.recentlyUnlocked)}
              >
                Voir les détails
              </button>
            </div>
          )}

          {rewardStats.nextToUnlock && (
            <div className="highlight-card next-reward">
              <div className="highlight-header">
                <h3>Prochaine récompense</h3>
                <span className="highlight-progress">
                  {rewardStats.nextToUnlock.progress}% complété
                </span>
              </div>
              <div className="highlight-content">
                <div className="highlight-icon">
                  <img
                    src={
                      rewardStats.nextToUnlock.iconUrl ||
                      "/placeholder.svg?height=100&width=100&text=🏆"
                    }
                    alt={
                      rewardStats.nextToUnlock.name[user?.languagePreference] ||
                      "Récompense"
                    }
                  />
                </div>
                <div className="highlight-info">
                  <h4 className="highlight-name">
                    {rewardStats.nextToUnlock.name[user?.languagePreference] ||
                      rewardStats.nextToUnlock.name?.en ||
                      "Récompense"}
                  </h4>
                  <p className="highlight-description">
                    {rewardStats.nextToUnlock.description[
                      user?.languagePreference
                    ] ||
                      rewardStats.nextToUnlock.description?.en ||
                      "Description de la récompense"}
                  </p>
                  <div className="highlight-meta">
                    <span
                      className={`highlight-tier ${getTierColorClass(
                        rewardStats.nextToUnlock.tier
                      )}`}
                    >
                      {getTierLabel(rewardStats.nextToUnlock.tier)}
                    </span>
                    <span className="highlight-criteria">
                      {getCriteriaIcon(rewardStats.nextToUnlock.criteria)}
                      {getCriteriaLabel(rewardStats.nextToUnlock.criteria)}
                    </span>
                  </div>
                  <div className="highlight-progress-bar">
                    <div
                      className="progress-bar"
                      style={{ width: `${rewardStats.nextToUnlock.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <button
                className="highlight-action"
                onClick={() => handleRewardClick(rewardStats.nextToUnlock)}
              >
                Voir les détails
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-stats">
          <div className="stats-card">
            <div className="stats-header">
              <h3>Statistiques des récompenses</h3>
            </div>
            <div className="stats-content">
              <div className="stats-chart">
                <Pie
                  data={{
                    labels: Object.keys(rewardStats.byType)
                      .filter((type) => rewardStats.byType[type].unlocked > 0)
                      .map((type) => getCriteriaLabel(type)),
                    datasets: [
                      {
                        data: Object.keys(rewardStats.byType)
                          .filter(
                            (type) => rewardStats.byType[type].unlocked > 0
                          )
                          .map((type) => rewardStats.byType[type].unlocked),
                        backgroundColor: [
                          "rgba(74, 145, 158, 0.7)",
                          "rgba(74, 201, 190, 0.7)",
                          "rgba(33, 46, 83, 0.7)",
                          "rgba(190, 211, 195, 0.7)",
                          "rgba(235, 172, 162, 0.7)",
                          "rgba(206, 106, 107, 0.7)",
                          "rgba(43, 90, 115, 0.7)",
                        ],
                        borderColor: [
                          "rgba(74, 145, 158, 1)",
                          "rgba(74, 201, 190, 1)",
                          "rgba(33, 46, 83, 1)",
                          "rgba(190, 211, 195, 1)",
                          "rgba(235, 172, 162, 1)",
                          "rgba(206, 106, 107, 1)",
                          "rgba(43, 90, 115, 1)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          color: noir,
                          font: {
                            size: 10,
                          },
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || "";
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce(
                              (a, b) => a + b,
                              0
                            );
                            const percentage = Math.round(
                              (value / total) * 100
                            );
                            return `${label}: ${value} (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="stats-info">
                <div className="stats-item">
                  <span className="stats-label">
                    Récompenses débloquées ce mois
                  </span>
                  <span className="stats-value">
                    {
                      myRewards.filter(
                        (r) =>
                          r.progress === 100 &&
                          new Date(r.unlockedAt) >
                            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      ).length
                    }
                  </span>
                </div>
                <div className="stats-item">
                  <span className="stats-label">
                    Récompenses les plus rares
                  </span>
                  <span className="stats-value">
                    {
                      filteredRewards().filter(
                        (r) => r.unlocked && r.unlockedPercentage < 10
                      ).length
                    }
                  </span>
                </div>
                <div className="stats-item">
                  <span className="stats-label">Progression moyenne</span>
                  <span className="stats-value">
                    {Math.round(
                      filteredRewards()
                        .filter((r) => !r.unlocked)
                        .reduce((sum, r) => sum + r.progress, 0) /
                        Math.max(
                          1,
                          filteredRewards().filter((r) => !r.unlocked).length
                        )
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get catalog content
  const getCatalogContent = () => {
    const filtered = sortedRewards();

    // If there are no rewards, show empty catalog
    if (rewards.length === 0) {
      return getEmptyCatalogContent();
    }

    return (
      <div className="rewards-catalog">
        <div className="catalog-header">
          <div className="catalog-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Rechercher une récompense..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <div className="catalog-actions">
            <div className="catalog-sort">
              <label>Trier par:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                styles={customSelectStyles}
              >
                <option value="progress">Progression</option>
                <option value="name">Nom</option>
                <option value="tier">Niveau</option>
                <option value="date">Date d'obtention</option>
                <option value="rarity">Rareté</option>
              </select>
            </div>

            <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span>Filtres</span>
              {showFilters ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="catalog-filters">
            <div className="filter-group">
              <label>Type</label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                styles={customSelectStyles}
              >
                <option value="all">Tous les types</option>
                <option value="steps">Pas</option>
                <option value="steps-time">Pas (Temps)</option>
                <option value="distance">Distance</option>
                <option value="distance-time">Distance (Temps)</option>
                <option value="calories">Calories</option>
                <option value="calories-time">Calories (Temps)</option>
                <option value="streak">Streak</option>
                <option value="level">Niveau</option>
                <option value="customgoal">Objectif personnalisé</option>
                <option value="challenges">Défis</option>
                <option value="challenges-time">Défis (Temps)</option>
                <option value="rank">Classement</option>
                <option value="friend">Social</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Niveau</label>
              <select
                value={filters.tier}
                onChange={(e) =>
                  setFilters({ ...filters, tier: e.target.value })
                }
                styles={customSelectStyles}
              >
                <option value="all">Tous les niveaux</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Argent</option>
                <option value="gold">Or</option>
                <option value="platinum">Platine</option>
                <option value="ruby">Rubis</option>
                <option value="sapphire">Saphir</option>
                <option value="diamond">Diamant</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Statut</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                styles={customSelectStyles}
              >
                <option value="all">Tous</option>
                <option value="unlocked">Débloqués</option>
                <option value="locked">Non débloqués</option>
              </select>
            </div>
          </div>
        )}

        <div className="catalog-grid">
          {filtered.map((reward) => (
            <div
              key={reward._id || reward.id}
              className={`reward-card ${
                reward.unlocked ? "unlocked" : "locked"
              }`}
              onClick={() => handleRewardClick(reward)}
            >
              <div className={`reward-tier ${getTierColorClass(reward.tier)}`}>
                <span>{getTierLabel(reward.tier)}</span>
              </div>

              <div className="reward-icon">
                <img
                  src={
                    reward.iconUrl ||
                    "/placeholder.svg?height=100&width=100&text=🏆"
                  }
                  alt={reward.name[user?.languagePreference] || "Récompense"}
                />
              </div>

              <div className="reward-info">
                <h3 className="reward-name">
                  {reward.name[user?.languagePreference] ||
                    reward.name?.en ||
                    "Récompense"}
                </h3>
                <p className="reward-description">
                  {reward.description[user?.languagePreference] ||
                    reward.description?.en ||
                    "Description de la récompense"}
                </p>

                <div className="reward-meta">
                  <span className="reward-criteria">
                    {getCriteriaIcon(reward.criteria)}
                    {getCriteriaLabel(reward.criteria)}
                  </span>
                  {reward.unlocked ? (
                    <span className="reward-unlocked-date">
                      <Clock size={16} />
                      {formatDate(reward.unlockedAt)}
                    </span>
                  ) : (
                    <span className="reward-rarity">
                      <Users size={16} />
                      {reward.unlockedPercentage}% des utilisateurs
                    </span>
                  )}
                </div>

                <div className="reward-progress">
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${reward.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{reward.progress}%</span>
                </div>
              </div>

              {reward.unlocked && (
                <div className="reward-actions">
                  <button
                    className={`showcase-button ${
                      vitrine.some(
                        (r) =>
                          (r.rewardId._id || r.rewardId.id) ===
                          (reward._id || reward.id)
                      )
                        ? "active"
                        : ""
                    } ${vitrine.length >= 3 ? "no-vitrine" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleShowcase(reward);
                    }}
                    title={
                      vitrine.some(
                        (r) =>
                          (r.rewardId._id || r.rewardId.id) ===
                          (reward._id || reward.id)
                      )
                        ? "Retirer de la vitrine"
                        : "Ajouter à la vitrine"
                    }
                  >
                    {vitrine.some(
                      (r) =>
                        (r.rewardId._id || r.rewardId.id) ===
                        (reward._id || reward.id)
                    ) ? (
                      <Bookmark size={16} />
                    ) : (
                      <BookmarkPlus size={16} />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="no-rewards">
              <p>
                Aucune récompense ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get showcase content
  const getShowcaseContent = () => {
    // If there are no unlocked rewards, show empty showcase
    if (!myRewards || myRewards.length === 0) {
      return getEmptyShowcaseContent();
    }

    return (
      <div className="rewards-showcase">
        <div className="showcase-header">
          <h2>Ma Vitrine de Récompenses</h2>
          <p>Mettez en avant vos récompenses préférées et les plus rares</p>
        </div>

        <div className="showcase-featured">
          {vitrine.length > 0 ? (
            vitrine.map((reward) => (
              <div
                key={reward._id || reward.id}
                className={`featured-reward ${getTierColorClass(
                  reward.rewardId.tier
                )}`}
                onClick={() => handleRewardClick(reward.rewardId)}
              >
                <div className="featured-icon">
                  <img
                    src={
                      reward.rewardId.iconUrl ||
                      "/placeholder.svg?height=100&width=100&text=🏆"
                    }
                    alt={
                      reward.rewardId.name[user?.languagePreference] ||
                      "Récompense"
                    }
                  />
                  <div className="featured-shine"></div>
                </div>
                <div className="featured-info">
                  <h3 className="featured-name">
                    {reward.rewardId.name[user?.languagePreference] ||
                      reward.rewardId.name?.en ||
                      "Récompense"}
                  </h3>
                  <p className="featured-description">
                    {reward.rewardId.description[user?.languagePreference] ||
                      reward.rewardId.description?.en ||
                      "Description de la récompense"}
                  </p>
                  <div className="featured-meta">
                    <span className="featured-tier">
                      {getTierLabel(reward.rewardId.tier)}
                    </span>
                    <span className="featured-criteria">
                      {getCriteriaLabel(reward.rewardId.criteria)}
                    </span>
                    <span className="featured-rarity">
                      {reward.rewardId.unlockedPercentage}% des utilisateurs
                    </span>
                  </div>
                </div>
                <button
                  className="remove-showcase"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleShowcase(reward.rewardId);
                  }}
                  title="Retirer de la vitrine"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-showcase">
              <p>
                Vous n'avez pas encore ajouté de récompenses à votre vitrine.
                Allez dans le catalogue et cliquez sur l'icône{" "}
                <BookmarkPlus size={16} /> pour ajouter une récompense à votre
                vitrine.
              </p>
            </div>
          )}
        </div>

        <div className="showcase-rarest">
          <h3>Vos récompenses les plus rares</h3>
          <div className="rarest-grid">
            {filteredRewards()
              .filter((r) => r.unlocked)
              .sort((a, b) => a.unlockedPercentage - b.unlockedPercentage)
              .slice(0, 3)
              .map((reward) => (
                <div
                  key={reward._id || reward.id}
                  className={`rarest-card ${getTierColorClass(reward.tier)}`}
                  onClick={() => handleRewardClick(reward)}
                >
                  <div className="rarest-percentage">
                    <span>{reward.unlockedPercentage}%</span>
                    <small>des utilisateurs</small>
                  </div>
                  <div className="rarest-icon">
                    <img
                      src={
                        reward.iconUrl ||
                        "/placeholder.svg?height=100&width=100&text=🏆"
                      }
                      alt={
                        reward.name[user?.languagePreference] || "Récompense"
                      }
                    />
                  </div>
                  <div className="rarest-info">
                    <h4>
                      {reward.name[user?.languagePreference] ||
                        reward.name?.en ||
                        "Récompense"}
                    </h4>
                    <p>
                      {reward.description[user?.languagePreference] ||
                        reward.description?.en ||
                        "Description de la récompense"}
                    </p>
                  </div>
                  {!vitrine.some(
                    (r) =>
                      (r.rewardId._id || r.rewardId.id) ===
                      (reward._id || reward.id)
                  ) && (
                    <button
                      className="add-to-showcase"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleShowcase(reward);
                      }}
                      disabled={vitrine.length >= 3}
                    >
                      <BookmarkPlus size={16} />
                      <span>Ajouter à la vitrine</span>
                    </button>
                  )}
                </div>
              ))}

            {filteredRewards().filter((r) => r.unlocked).length === 0 && (
              <div className="no-rewards">
                <p>Vous n'avez pas encore débloqué de récompenses rares.</p>
              </div>
            )}
          </div>
        </div>

        <div className="showcase-compare">
          <h3>Comparez avec vos amis</h3>
          <div className="compare-friends">
            <div className="friend-selector">
              <select styles={customSelectStyles}>
                <option value="">Sélectionnez un ami</option>
                {user?.friends.map((friend) => (
                  <option key={friend._id} value="friend1">
                    {friend.userId.fullName}
                  </option>
                ))}
              </select>
              <button className="compare-button">Comparer</button>
            </div>
            <p className="compare-info">
              Sélectionnez un ami pour voir quelles récompenses vous avez en
              commun et celles qu'il a débloquées mais pas vous.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Get stats content
  const getStatsContent = () => {
    // If there are no unlocked rewards, show empty dashboard (reuse the same component)
    if (!myRewards || myRewards.length === 0) {
      return getEmptyDashboardContent();
    }

    // Chart data for criteria distribution
    const criteriaDistributionData = {
      labels: Object.entries(rewardStats.byType).map(([criteria]) =>
        getCriteriaLabel(criteria)
      ),
      datasets: [
        {
          data: Object.entries(rewardStats.byType).map(
            ([, stats]) => stats.total
          ),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
        },
      ],
    };

    // Chart data for tier distribution
    const tierDistributionData = {
      labels: Object.entries(rewardStats.byTier).map(([tier]) =>
        getTierLabel(tier)
      ),
      datasets: [
        {
          data: Object.entries(rewardStats.byTier).map(
            ([, stats]) => stats.total
          ),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(128, 0, 128, 0.6)", // Purple for diamond
          ],
        },
      ],
    };

    // Chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: false,
        },
      },
    };

    return (
      <div className="rewards-stats">
        <div className="stats-header">
          <h2>Statistiques des Récompenses</h2>
          <p>Analysez votre progression et vos accomplissements</p>
        </div>

        <div className="stats-overview">
          <div className="stats-card">
            <div className="stats-card-header">
              <h3>Répartition par type</h3>
            </div>
            <div className="stats-card-content">
              <Pie
                data={{
                  labels: Object.keys(rewardStats.byType)
                    .filter((type) => rewardStats.byType[type].unlocked > 0)
                    .map((type) => getCriteriaLabel(type)),
                  datasets: [
                    {
                      data: Object.keys(rewardStats.byType)
                        .filter((type) => rewardStats.byType[type].unlocked > 0)
                        .map((type) => rewardStats.byType[type].unlocked),
                      backgroundColor: [
                        "rgba(74, 145, 158, 0.7)",
                        "rgba(74, 201, 190, 0.7)",
                        "rgba(33, 46, 83, 0.7)",
                        "rgba(190, 211, 195, 0.7)",
                        "rgba(235, 172, 162, 0.7)",
                        "rgba(206, 106, 107, 0.7)",
                        "rgba(43, 90, 115, 0.7)",
                      ],
                      borderColor: [
                        "rgba(74, 145, 158, 1)",
                        "rgba(74, 201, 190, 1)",
                        "rgba(33, 46, 83, 1)",
                        "rgba(190, 211, 195, 1)",
                        "rgba(235, 172, 162, 1)",
                        "rgba(206, 106, 107, 1)",
                        "rgba(43, 90, 115, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: "right",
                      labels: {
                        color: noir,
                        font: {
                          size: 10,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-card-header">
              <h3>Répartition par niveau</h3>
            </div>
            <div className="stats-card-content">
              <Bar
                data={{
                  labels: Object.keys(rewardStats.byTier)
                    .filter((tier) => rewardStats.byTier[tier].total > 0)
                    .map((tier) => getTierLabel(tier)),
                  datasets: [
                    {
                      label: "Débloquées",
                      data: Object.keys(rewardStats.byTier)
                        .filter((tier) => rewardStats.byTier[tier].total > 0)
                        .map((tier) => rewardStats.byTier[tier].unlocked),
                      backgroundColor: "rgba(74, 145, 158, 0.7)",
                      borderColor: "rgba(74, 145, 158, 1)",
                      borderWidth: 1,
                    },
                    {
                      label: "Verrouillées",
                      data: Object.keys(rewardStats.byTier)
                        .filter((tier) => rewardStats.byTier[tier].total > 0)
                        .map(
                          (tier) =>
                            rewardStats.byTier[tier].total -
                            rewardStats.byTier[tier].unlocked
                        ),
                      backgroundColor: "rgba(190, 211, 195, 0.7)",
                      borderColor: "rgba(190, 211, 195, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  scales: {
                    x: {
                      stacked: true,
                      ticks: {
                        color: noir,
                      },
                    },
                    y: {
                      stacked: true,
                      ticks: {
                        color: noir,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        color: noir,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-card-header">
              <h3>Progression mensuelle</h3>
            </div>
            <div className="stats-card-content">
              <Bar
                data={{
                  labels: [
                    "Jan",
                    "Fév",
                    "Mar",
                    "Avr",
                    "Mai",
                    "Juin",
                    "Juil",
                    "Août",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Déc",
                  ],
                  datasets: [
                    {
                      label: "Récompenses débloquées",
                      data: generateMonthlyRewardsData(),
                      backgroundColor: "rgba(74, 145, 158, 0.7)",
                      borderColor: "rgba(74, 145, 158, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  scales: {
                    x: {
                      ticks: {
                        color: noir,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        color: noir,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        color: noir,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="stats-details">
          <div className="stats-table-container">
            <h3>Historique des récompenses</h3>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Récompense</th>
                  <th>Type</th>
                  <th>Niveau</th>
                  <th>Date d'obtention</th>
                  <th>Rareté</th>
                </tr>
              </thead>
              <tbody>
                {filteredRewards()
                  .filter((r) => r.unlocked)
                  .sort(
                    (a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)
                  )
                  .slice(0, 10)
                  .map((reward) => (
                    <tr
                      key={reward._id || reward.id}
                      onClick={() => handleRewardClick(reward)}
                    >
                      <td>
                        <div className="table-reward">
                          <img
                            src={
                              reward.iconUrl ||
                              "/placeholder.svg?height=100&width=100&text=🏆"
                            }
                            alt={
                              reward.name[user?.languagePreference] ||
                              "Récompense"
                            }
                            className="table-icon"
                          />
                          <span>
                            {reward.name[user?.languagePreference] ||
                              reward.name?.en ||
                              "Récompense"}
                          </span>
                        </div>
                      </td>
                      <td>{getCriteriaLabel(reward.criteria)}</td>
                      <td>
                        <span
                          className={`table-tier ${getTierColorClass(
                            reward.tier
                          )}`}
                        >
                          {getTierLabel(reward.tier)}
                        </span>
                      </td>
                      <td>{formatDate(reward.unlockedAt)}</td>
                      <td>{reward.unlockedPercentage}%</td>
                    </tr>
                  ))}

                {filteredRewards().filter((r) => r.unlocked).length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      Aucune récompense débloquée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="stats-insights">
          <h3>Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">
                <Flame size={24} />
              </div>
              <div className="insight-content">
                <h4>Votre meilleur mois</h4>
                <p>
                  <strong>Mai 2025</strong> - Vous avez débloqué{" "}
                  {generateMonthlyRewardsData()[4]} récompenses ce mois-là !
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">
                <Target size={24} />
              </div>
              <div className="insight-content">
                <h4>Votre point fort</h4>
                <p>
                  <strong>
                    {(() => {
                      // Find the category with the highest unlock percentage
                      const categories = Object.entries(
                        rewardStats.byType
                      ).filter(([_, stats]) => stats.total > 0);
                      if (categories.length === 0) return "Pas quotidiens";

                      const highestCategory = categories.reduce(
                        (prev, curr) => {
                          const prevPercentage =
                            prev[1].unlocked / prev[1].total;
                          const currPercentage =
                            curr[1].unlocked / curr[1].total;
                          return prevPercentage > currPercentage ? prev : curr;
                        }
                      );

                      return getCriteriaLabel(highestCategory[0]);
                    })()}
                  </strong>{" "}
                  - Vous excellez dans cette catégorie !
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">
                <ArrowUp size={24} />
              </div>
              <div className="insight-content">
                <h4>Progression rapide</h4>
                <p>
                  <strong>+15%</strong> de récompenses débloquées par rapport au
                  mois dernier !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get tab content based on active tab
  const getTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return getDashboardContent();
      case "catalog":
        return getCatalogContent();
      case "showcase":
        return getShowcaseContent();
      case "stats":
        return getStatsContent();
      default:
        return getDashboardContent();
    }
  };

  return (
    <div className="rewards-container">
      {isLoading && <GlobalLoader />}
      <div className="rewards-header">
        <h1>Mes Récompenses</h1>
        <p>
          Découvrez et suivez votre progression à travers les différentes
          récompenses
        </p>
      </div>

      <div className="rewards-tabs">
        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          <Trophy size={16} />
          <span>Tableau de bord</span>
        </button>
        <button
          className={activeTab === "catalog" ? "active" : ""}
          onClick={() => setActiveTab("catalog")}
        >
          <Medal size={16} />
          <span>Catalogue</span>
        </button>
        <button
          className={activeTab === "showcase" ? "active" : ""}
          onClick={() => setActiveTab("showcase")}
        >
          <Star size={16} />
          <span>Vitrine</span>
        </button>
        <button
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => setActiveTab("stats")}
        >
          <BarChart2 size={16} />
          <span>Statistiques</span>
        </button>
      </div>

      <div className="rewards-content">{getTabContent()}</div>

      {/* Reward Detail Modal */}
      {showRewardModal && selectedReward && (
        <div
          className="modal-overlay"
          onClick={handleOverlayClick}
          ref={RewardModalRef}
        >
          <div className="modal reward-modal">
            <div className="modal-header">
              <h3>Détails de la récompense</h3>
              <button
                className="close-button"
                onClick={() => {
                  setShowRewardModal(false);
                  setSelectedReward(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="reward-modal-content">
              <div
                className={`reward-modal-icon ${getTierColorClass(
                  selectedReward.tier
                )}`}
              >
                <img
                  src={
                    selectedReward.iconUrl ||
                    "/placeholder.svg?height=100&width=100&text=🏆"
                  }
                  alt={
                    selectedReward.name[user?.languagePreference] ||
                    "Récompense"
                  }
                />
              </div>

              <div className="reward-modal-info">
                <h2 className="reward-modal-name">
                  {selectedReward.name[user?.languagePreference] ||
                    selectedReward.name?.en ||
                    "Récompense"}
                </h2>
                <p className="reward-modal-description">
                  {selectedReward.description[user?.languagePreference] ||
                    selectedReward.description?.en ||
                    "Description de la récompense"}
                </p>

                <div className="reward-modal-meta">
                  <div className="meta-item">
                    <span className="meta-label">Type</span>
                    <span className="meta-value">
                      {getCriteriaIcon(selectedReward.criteria)}{" "}
                      {getCriteriaLabel(selectedReward.criteria)}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Niveau</span>
                    <span
                      className={`meta-value tier-badge ${getTierColorClass(
                        selectedReward.tier
                      )}`}
                    >
                      {getTierLabel(selectedReward.tier)}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Objectif</span>
                    <span className="meta-value">
                      {selectedReward.target.toLocaleString()}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Rareté</span>
                    <span className="meta-value">
                      {selectedReward.unlockedPercentage}% des utilisateurs
                    </span>
                  </div>

                  {selectedReward.unlocked && (
                    <div className="meta-item">
                      <span className="meta-label">Débloqué le</span>
                      <span className="meta-value">
                        {formatDate(selectedReward.unlockedAt)}
                      </span>
                    </div>
                  )}

                  {selectedReward.isRepeatable && (
                    <div className="meta-item">
                      <span className="meta-label">Type</span>
                      <span className="meta-value repeatable-badge">
                        Répétable
                      </span>
                    </div>
                  )}
                </div>

                {!selectedReward.unlocked && (
                  <div className="reward-modal-progress">
                    <div className="progress-label">
                      <span>Progression</span>
                      <span>{selectedReward.progress}%</span>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${selectedReward.progress}%` }}
                      ></div>
                    </div>
                    <p className="progress-hint">
                      {selectedReward.progress > 0
                        ? `Continuez vos efforts ! Vous êtes sur la bonne voie pour débloquer cette récompense.`
                        : `Commencez à accumuler des ${getCriteriaLabel(
                            selectedReward.criteria
                          ).toLowerCase()} pour progresser vers cette récompense.`}
                    </p>
                  </div>
                )}

                <div className="reward-modal-actions">
                  {selectedReward.unlocked ? (
                    <>
                      <button
                        className={`showcase-action ${
                          vitrine.some(
                            (r) =>
                              (r.rewardId._id || r.rewardId.id) ===
                              (selectedReward._id || selectedReward.id)
                          )
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleToggleShowcase(selectedReward)}
                        disabled={
                          vitrine.length >= 3 &&
                          !vitrine.some(
                            (r) =>
                              (r.rewardId._id || r.rewardId.id) ===
                              (selectedReward._id || selectedReward.id)
                          )
                        }
                      >
                        {vitrine.some(
                          (r) =>
                            (r.rewardId._id || r.rewardId.id) ===
                            (selectedReward._id || selectedReward.id)
                        ) ? (
                          <>
                            <Bookmark size={16} />
                            <span>Retirer de la vitrine</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus size={16} />
                            <span>Ajouter à la vitrine</span>
                          </>
                        )}
                      </button>
                      <button className="share-action">
                        <Share2 size={16} />
                        <span>Partager</span>
                      </button>
                    </>
                  ) : (
                    <button className="focus-action">
                      {" "}
                      {/* TODO: fonction définir comme objectif un reward */}
                      <Target size={16} />
                      <span>Définir comme objectif</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            {selectedReward.unlocked && (
              <div className="reward-modal-social">
                <h4>Qui d'autre a débloqué cette récompense ?</h4>
                {(() => {
                  const otherOwners = selectedReward.earnedBy.filter(
                    (owner) => owner.user._id !== user?._id
                  );
                  const displayedOwners = showAllUsers
                    ? otherOwners
                    : otherOwners.slice(0, 3);
                  const hiddenCount = otherOwners.length - 3;

                  return otherOwners.length > 0 ? (
                    <div className="social-users">
                      {displayedOwners.map((owner) => (
                        <div key={owner.user._id} className="user-avatar">
                          <img
                            src={
                              owner.user.avatarUrl ||
                              "/placeholder.svg?height=40&width=40&text=TM"
                            }
                            alt="User"
                          />
                          <span className="user-name">
                            {owner.user.fullName}
                          </span>
                        </div>
                      ))}
                      {otherOwners.length > 3 && (
                        <button
                          onClick={() => setShowAllUsers(!showAllUsers)}
                          className="more-users"
                        >
                          {showAllUsers ? "Voir moins" : `+${hiddenCount}`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p>
                      Personne n'a jamais débloqué cette récompense à part vous
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reward Animation */}
      {animateReward && (
        <div className="reward-animation">
          <div className="animation-content">
            <div className="animation-icon">
              <img
                src={
                  animateReward.iconUrl ||
                  "/placeholder.svg?height=100&width=100&text=🏆"
                }
                alt={
                  animateReward.name[user?.languagePreference] || "Récompense"
                }
              />
            </div>
            <div className="animation-text">
              <h3>Nouvelle récompense débloquée !</h3>
              <h2>
                {animateReward.name[user?.languagePreference] ||
                  animateReward.name?.en ||
                  "Récompense"}
              </h2>
            </div>
            <div className="animation-confetti" ref={confettiRef}></div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="privacy-notice">
        <Info size={16} />
        <p>
          Vos récompenses sont visibles par vos amis.{" "}
          <Link to="/settings">Modifier les paramètres de confidentialité</Link>
        </p>
      </div>
    </div>
  );
};

export default Rewards;
