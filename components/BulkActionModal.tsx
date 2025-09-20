
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';
import ActionButton from './ActionButton';

interface BulkActionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedItems: string[];
  onBulkDelete: (items: string[]) => Promise<void>;
  onBulkExport: (items: string[]) => Promise<void>;
  onBulkPrint?: (items: string[]) => Promise<void>;
  itemType: 'students' | 'payments' | 'fees';
}

const BulkActionModal: React.FC<BulkActionModalProps> = ({
  visible,
  onClose,
  selectedItems,
  onBulkDelete,
  onBulkExport,
  onBulkPrint,
  itemType
}) => {
  const [loading, setLoading] = useState(false);

  const handleBulkDelete = () => {
    Alert.alert(
      'Confirmation',
      `Êtes-vous sûr de vouloir supprimer ${selectedItems.length} élément(s) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await onBulkDelete(selectedItems);
              onClose();
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la suppression');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleBulkExport = async () => {
    setLoading(true);
    try {
      await onBulkExport(selectedItems);
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPrint = async () => {
    if (!onBulkPrint) return;
    
    setLoading(true);
    try {
      await onBulkPrint(selectedItems);
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'impression');
    } finally {
      setLoading(false);
    }
  };

  const getItemTypeLabel = () => {
    switch (itemType) {
      case 'students':
        return 'élève(s)';
      case 'payments':
        return 'paiement(s)';
      case 'fees':
        return 'frais';
      default:
        return 'élément(s)';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Actions groupées</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.selectionInfo}>
            <Icon name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.selectionText}>
              {selectedItems.length} {getItemTypeLabel()} sélectionné(s)
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <ActionButton
              title="Exporter la sélection"
              icon="download"
              variant="primary"
              onPress={handleBulkExport}
              disabled={loading}
              style={styles.actionButton}
            />

            {onBulkPrint && (
              <ActionButton
                title="Imprimer la sélection"
                icon="print"
                variant="secondary"
                onPress={handleBulkPrint}
                disabled={loading}
                style={styles.actionButton}
              />
            )}

            <ActionButton
              title="Supprimer la sélection"
              icon="trash"
              variant="error"
              onPress={handleBulkDelete}
              disabled={loading}
              style={styles.actionButton}
            />
          </View>

          <View style={styles.warningContainer}>
            <Icon name="warning" size={20} color={colors.warning} />
            <Text style={styles.warningText}>
              Les actions groupées sont irréversibles. Assurez-vous de votre sélection avant de continuer.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '30',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  selectionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '20',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default BulkActionModal;
