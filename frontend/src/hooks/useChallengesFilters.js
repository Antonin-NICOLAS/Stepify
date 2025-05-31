import { useState, useMemo } from "react";

export const useChallengesFilters = (user, challenges, publicChallenges) => {
    const [sortBy, setSortBy] = useState("recent");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredChallenges = useMemo(() => {
        let filtered = [...challenges];

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (challenge) =>
                    challenge.name[user?.languagePreference].toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (challenge.description && challenge.description[user?.languagePreference].toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Apply type filter
        if (filterType !== "all") {
            filtered = filtered.filter((challenge) => challenge.activityType === filterType);
        }

        // Apply status filter
        if (filterStatus !== "all") {
            filtered = filtered.filter((challenge) => challenge.status === filterStatus);
        }

        // Sort challenges
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "recent":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case "ending-soon":
                    return new Date(a.endDate) - new Date(b.endDate);
                case "progress":
                    const progressA = computeGlobalProgress(a.participants);
                    const progressB = computeGlobalProgress(b.participants);
                    return progressB - progressA;
                case "participants":
                    return b.participants.length - a.participants.length;
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return filtered;
    }, [challenges, sortBy, filterType, filterStatus, searchQuery]);

    const filteredPublicChallenges = useMemo(() => {
        let filtered = [...publicChallenges]

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (challenge) =>
                    challenge.name[user?.languagePreference].toLowerCase().includes(searchQuery.toLowerCase()) ||
                    challenge.description[user?.languagePreference].toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Apply type filter
        if (filterType !== "all") {
            filtered = filtered.filter((challenge) => challenge.activityType === filterType)
        }

        // Apply status filter
        if (filterStatus !== "all") {
            filtered = filtered.filter((challenge) => challenge.status === filterStatus)
        }

        // Sort challenges
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "recent":
                    return new Date(b.createdAt) - new Date(a.createdAt)
                case "ending-soon":
                    return new Date(a.endDate) - new Date(b.endDate)
                case "progress":
                    const progressA = computeGlobalProgress(a.participants);
                    const progressB = computeGlobalProgress(b.participants);
                    return progressB - progressA;
                case "participants":
                    return b.participants.length - a.participants.length
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt)
            }
        })

        return filtered
    }, [publicChallenges, sortBy, filterType, filterStatus, searchQuery]);

    return {
        sortBy,
        setSortBy,
        filterType,
        setFilterType,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        filteredChallenges,
        filteredPublicChallenges
    };
};