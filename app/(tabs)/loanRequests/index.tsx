import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '@react-navigation/native';
import { useLoan } from '@/context/LoanContextProvider';
import { formatCurrency } from '@/utilities/format';
import { Ionicons } from '@expo/vector-icons';
import { CreateLoanRequestDTO, LoanRequest } from '@/services/api.loan.service';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { CreateLoanRequestModal } from '@/components/modalComponent/CreateLoanRequestModal';

type DirectionFilter = 'all' | 'incoming' | 'outgoing';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type SortBy = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

interface FilterButtonProps {
    label: string;
    isSelected: boolean;
    onPress: () => void;
}

export default function LoanRequestsScreen() {
    const router = useRouter();
    const { colors: theme } = useTheme();
    const [isCreateModalVisible, setIsCreateModalVisible] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortBy, setSortBy] = useState<SortBy>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const {
        incomingRequests,
        outgoingRequests,
        isLoading,
        refreshLoanRequests,
        createLoanRequest,
    } = useLoan();

    const handleCreateLoanRequest = async (data: CreateLoanRequestDTO) => {
        try {
            await createLoanRequest(data);
            setIsCreateModalVisible(false);
            await refreshLoanRequests();
        } catch (error) {
            console.error('Failed to create loan request:', error);
            // TODO: Show error toast
        }
    };

    const filteredAndSortedRequests = useMemo(() => {
        let requests = [];
        if (directionFilter === 'incoming') {
            requests = [...incomingRequests];
        } else if (directionFilter === 'outgoing') {
            requests = [...outgoingRequests];
        } else {
            requests = [...incomingRequests, ...outgoingRequests];
        }

        if (statusFilter !== 'all') {
            requests = requests.filter(req => req.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            requests = requests.filter(req =>
                req.borrowerId.firstName.toLowerCase().includes(query) ||
                req.lenderId.firstName.toLowerCase().includes(query) ||
                formatCurrency(req.amount).toLowerCase().includes(query)
            );
        }

        return requests.sort((a, b) => {
            if (sortBy === 'date') {
                const comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                return sortOrder === 'asc' ? -comparison : comparison;
            } else {
                const comparison = b.amount - a.amount;
                return sortOrder === 'asc' ? -comparison : comparison;
            }
        });
    }, [incomingRequests, outgoingRequests, directionFilter, statusFilter, sortBy, sortOrder, searchQuery]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await refreshLoanRequests();
        } finally {
            setRefreshing(false);
        }
    }, [refreshLoanRequests]);

    const handleLoanRequestPress = (id: string) => {
        router.push(`/loanRequests/${id}`);
    };

    const FilterButton = ({ label, isSelected, onPress }: FilterButtonProps) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                isSelected && { backgroundColor: theme.primary },
            ]}
            onPress={onPress}
        >
            <ThemedText style={[
                styles.filterButtonText,
                isSelected && { color: '#fff' }
            ]}>
                {label}
            </ThemedText>
        </TouchableOpacity>
    );

    const renderLoanRequest = ({ item }: { item: LoanRequest }) => {
        const isIncoming = incomingRequests.includes(item);
        const status = item.status.charAt(0).toUpperCase() + item.status.slice(1);

        return (
            <TouchableOpacity
                style={[styles.listItem, { backgroundColor: theme.card }]}
                onPress={() => handleLoanRequestPress(item._id)}
            >
                <View style={styles.listItemContent}>
                    <View style={styles.listItemHeader}>
                        <Ionicons
                            name={isIncoming ? 'arrow-down' : 'arrow-up'}
                            size={24}
                            color={theme.primary}
                        />
                        <ThemedText style={[styles.listItemTitle, { color: theme.text }]}>
                            {formatCurrency(item.amount)} - {status}
                        </ThemedText>
                    </View>
                    <ThemedText style={[styles.listItemDescription, { color: theme.text }]}>
                        From: {item.borrowerId.firstName}{'\n'}
                        To: {item.lenderId.firstName}{'\n'}
                        Duration: {item.durationInMonths} months
                    </ThemedText>
                </View>
            </TouchableOpacity>
        );
    };

    const SortMenu = () => (
        <Modal
            visible={showSortMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowSortMenu(false)}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowSortMenu(false)}
            >
                <View style={[styles.sortMenu, { backgroundColor: theme.card }]}>
                    <TouchableOpacity
                        style={styles.sortMenuItem}
                        onPress={() => {
                            setSortBy(sortBy === 'date' ? 'amount' : 'date');
                            setShowSortMenu(false);
                        }}
                    >
                        <ThemedText style={[styles.sortMenuText, { color: theme.text }]}>
                            Sort by: {sortBy === 'date' ? 'Date' : 'Amount'}
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.sortMenuItem}
                        onPress={() => {
                            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                            setShowSortMenu(false);
                        }}
                    >
                        <ThemedText style={[styles.sortMenuText, { color: theme.text }]}>
                            Order: {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={theme.text} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search requests..."
                        placeholderTextColor={theme.text}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.sortButton, { backgroundColor: theme.card }]}
                    onPress={() => setShowSortMenu(true)}
                >
                    <Ionicons name="funnel" size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    <FilterButton
                        label="All"
                        isSelected={directionFilter === 'all'}
                        onPress={() => setDirectionFilter('all')}
                    />
                    <FilterButton
                        label="Incoming"
                        isSelected={directionFilter === 'incoming'}
                        onPress={() => setDirectionFilter('incoming')}
                    />
                    <FilterButton
                        label="Outgoing"
                        isSelected={directionFilter === 'outgoing'}
                        onPress={() => setDirectionFilter('outgoing')}
                    />
                </ScrollView>
            </View>

            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    <FilterButton
                        label="All Status"
                        isSelected={statusFilter === 'all'}
                        onPress={() => setStatusFilter('all')}
                    />
                    <FilterButton
                        label="Pending"
                        isSelected={statusFilter === 'pending'}
                        onPress={() => setStatusFilter('pending')}
                    />
                    <FilterButton
                        label="Approved"
                        isSelected={statusFilter === 'approved'}
                        onPress={() => setStatusFilter('approved')}
                    />
                    <FilterButton
                        label="Rejected"
                        isSelected={statusFilter === 'rejected'}
                        onPress={() => setStatusFilter('rejected')}
                    />
                </ScrollView>
            </View>

            <FlashList
                data={filteredAndSortedRequests}
                renderItem={renderLoanRequest}
                estimatedItemSize={100}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />

            <CreateLoanRequestModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSubmit={handleCreateLoanRequest}
            />

            <SortMenu />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 8,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    sortButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    filterScroll: {
        gap: 8,
        paddingVertical: 4,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.light.tint,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    listItem: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    listItemContent: {
        padding: 16,
    },
    listItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    listItemDescription: {
        fontSize: 14,
        opacity: 0.7,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortMenu: {
        width: '80%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    sortMenuItem: {
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.light.tint,
    },
    sortMenuText: {
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});