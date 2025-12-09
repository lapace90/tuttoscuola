import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, Alert } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useHomework } from '../../../hooks/useHomework';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

const Homework = () => {
  const router = useRouter();
  const { 
    homework,
    pendingHomework,
    completedHomework,
    pendingCount,
    completedCount,
    loading, 
    refreshing, 
    refresh,
    toggleComplete,
    remove,
    getDueStatus,
    isStudent,
    isTeacher
  } = useHomework();

  const handleDelete = (item) => {
    Alert.alert(
      'Elimina compito',
      'Sei sicuro di voler eliminare questo compito?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => remove(item.id)
        }
      ]
    );
  };

  const getDueColor = (status) => {
    switch (status) {
      case 'overdue':
      case 'today':
        return theme.colors.error;
      case 'tomorrow':
      case 'soon':
        return theme.colors.warning;
      default:
        return theme.colors.textLight;
    }
  };

  const renderHomeworkItem = ({ item }) => {
    const dueInfo = getDueStatus(item.due_date);
    const dueColor = getDueColor(dueInfo.status);

    return (
      <Pressable
        style={[styles.card, item.completed && styles.cardCompleted]}
        onPress={() => isStudent && toggleComplete(item.id)}
        onLongPress={() => isTeacher && handleDelete(item)}
      >
        <View style={styles.cardLeft}>
          {isStudent && (
            <Pressable
              style={[styles.checkbox, item.completed && styles.checkboxChecked]}
              onPress={() => toggleComplete(item.id)}
            >
              {item.completed && <Icon name="check" size={14} color="white" />}
            </Pressable>
          )}
          <View style={styles.cardContent}>
            <Text style={[styles.cardSubject, item.completed && styles.textCompleted]}>
              {item.subject}
            </Text>
            <Text style={[styles.cardTitle, item.completed && styles.textCompleted]}>
              {item.title}
            </Text>
            {item.description && (
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            {!isStudent && item.class && (
              <Text style={styles.classText}>Classe {item.class.name}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.cardRight}>
          <Text style={[styles.dueText, { color: dueColor }]}>
            {dueInfo.label}
          </Text>
          {item.teacher && (
            <Text style={styles.teacherText}>{item.teacher.last_name}</Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Compiti</Text>
        {isTeacher ? (
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/(main)/homework/create')}
          >
            <Icon name="plus" size={22} color="white" />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Summary for students */}
      {isStudent && homework.length > 0 && (
        <View style={styles.summary}>
          <View style={[styles.summaryItem, { backgroundColor: theme.colors.warning + '20' }]}>
            <Text style={[styles.summaryNumber, { color: theme.colors.warning }]}>
              {pendingCount}
            </Text>
            <Text style={styles.summaryLabel}>Da fare</Text>
          </View>
          <View style={[styles.summaryItem, { backgroundColor: theme.colors.success + '20' }]}>
            <Text style={[styles.summaryNumber, { color: theme.colors.success }]}>
              {completedCount}
            </Text>
            <Text style={styles.summaryLabel}>Completati</Text>
          </View>
        </View>
      )}

      <FlatList
        data={isStudent ? [...pendingHomework, ...completedHomework] : homework}
        keyExtractor={(item) => item.id}
        renderItem={renderHomeworkItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="book" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>
              {loading ? 'Caricamento...' : 'Nessun compito'}
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
};

export default Homework;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summary: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
    gap: wp(3),
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderRadius: theme.radius.lg,
  },
  summaryNumber: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
  },
  summaryLabel: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    marginBottom: hp(1),
    ...theme.shadows.sm,
  },
  cardCompleted: {
    opacity: 0.6,
  },
  cardLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  cardContent: {
    flex: 1,
  },
  cardSubject: {
    fontSize: hp(1.3),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.secondary,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    marginTop: 2,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
  },
  cardDescription: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: 4,
  },
  classText: {
    fontSize: hp(1.3),
    color: theme.colors.primary,
    marginTop: 4,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dueText: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semiBold,
  },
  teacherText: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(15),
    gap: hp(2),
  },
  emptyText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
});