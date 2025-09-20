
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Fee } from '../hooks/useSupabaseFees';

interface AddFeeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (fee: Fee) => Promise<void>;
  fee?: Fee;
  isEditing?: boolean;
}

const AddFeeModal: React.FC<AddFeeModalProps> = ({
  visible,
  onClose,
  onSave,
  fee,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<Fee>({
    code: fee?.code || '',
    description: fee?.description || '',
    montant: fee?.montant || 0,
    classe: fee?.classe || '',
    obligatoire: fee?.obligatoire || false,
    periodicite: fee?.periodicite || ''
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!formData.code.trim()) {
      Alert.alert('Erreur', 'Le code est obligatoire');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erreur', 'La description est obligatoire');
      return;
    }
    if (formData.montant <= 0) {
      Alert.alert('Erreur', 'Le montant doit être supérieur à 0');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
      // Reset form
      setFormData({
        code: '',
        description: '',
        montant: 0,
        classe: '',
        obligatoire: false,
        periodicite: ''
      });
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la sauvegarde: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditing ? 'Modifier le frais' : 'Ajouter un frais'}
          </Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Code *</Text>
            <TextInput
              style={styles.input}
              value={formData.code}
              onChangeText={(text) => setFormData({...formData, code: text.toUpperCase()})}
              placeholder="Ex: SCOL001"
              editable={!isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              placeholder="Description du frais"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Montant (FCFA) *</Text>
            <TextInput
              style={styles.input}
              value={formData.montant.toString()}
              onChangeText={(text) => {
                const amount = parseFloat(text) || 0;
                setFormData({...formData, montant: amount});
              }}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Classe (optionnel)</Text>
            <TextInput
              style={styles.input}
              value={formData.classe}
              onChangeText={(text) => setFormData({...formData, classe: text})}
              placeholder="Ex: 6ème A (laisser vide pour toutes les classes)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Périodicité (optionnel)</Text>
            <TextInput
              style={styles.input}
              value={formData.periodicite}
              onChangeText={(text) => setFormData({...formData, periodicite: text})}
              placeholder="Ex: Mensuel, Trimestriel, Annuel"
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.label}>Frais obligatoire</Text>
            <Switch
              value={formData.obligatoire}
              onValueChange={(value) => setFormData({...formData, obligatoire: value})}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={formData.obligatoire ? colors.surface : colors.textSecondary}
            />
          </View>

          <View style={styles.infoBox}>
            <Icon name="info" size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              Les frais obligatoires s'appliquent automatiquement à tous les élèves. 
              Les frais non obligatoires peuvent être associés à des classes spécifiques.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    lineHeight: 20,
  },
});

export default AddFeeModal;
