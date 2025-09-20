
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
  Platform
} from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Student } from '../types';
import { Picker } from '@react-native-picker/picker';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (student: Student) => Promise<void>;
  student?: Student;
  isEditing?: boolean;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  visible,
  onClose,
  onSave,
  student,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<Student>({
    matricule: student?.matricule || '',
    nom: student?.nom || '',
    prenom: student?.prenom || '',
    sexe: student?.sexe || 'M',
    dateNaissance: student?.dateNaissance || '',
    classe: student?.classe || '',
    contactParent: student?.contactParent || '',
    emailParent: student?.emailParent || '',
    dateInscription: student?.dateInscription || new Date().toISOString().split('T')[0],
    statut: student?.statut || 'actif'
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!formData.matricule.trim()) {
      Alert.alert('Erreur', 'Le matricule est obligatoire');
      return;
    }
    if (!formData.nom.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }
    if (!formData.prenom.trim()) {
      Alert.alert('Erreur', 'Le prénom est obligatoire');
      return;
    }
    if (!formData.classe.trim()) {
      Alert.alert('Erreur', 'La classe est obligatoire');
      return;
    }
    if (!formData.contactParent.trim()) {
      Alert.alert('Erreur', 'Le contact parent est obligatoire');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
      // Reset form
      setFormData({
        matricule: '',
        nom: '',
        prenom: '',
        sexe: 'M',
        dateNaissance: '',
        classe: '',
        contactParent: '',
        emailParent: '',
        dateInscription: new Date().toISOString().split('T')[0],
        statut: 'actif'
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
            {isEditing ? 'Modifier l\'élève' : 'Ajouter un élève'}
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
            <Text style={styles.label}>Matricule *</Text>
            <TextInput
              style={styles.input}
              value={formData.matricule}
              onChangeText={(text) => setFormData({...formData, matricule: text})}
              placeholder="Ex: ETU001"
              editable={!isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={formData.nom}
              onChangeText={(text) => setFormData({...formData, nom: text.toUpperCase()})}
              placeholder="Nom de famille"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={styles.input}
              value={formData.prenom}
              onChangeText={(text) => setFormData({...formData, prenom: text})}
              placeholder="Prénom"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sexe *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.sexe}
                onValueChange={(value) => setFormData({...formData, sexe: value})}
                style={styles.picker}
              >
                <Picker.Item label="Masculin" value="M" />
                <Picker.Item label="Féminin" value="F" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date de naissance</Text>
            <TextInput
              style={styles.input}
              value={formData.dateNaissance}
              onChangeText={(text) => setFormData({...formData, dateNaissance: text})}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Classe *</Text>
            <TextInput
              style={styles.input}
              value={formData.classe}
              onChangeText={(text) => setFormData({...formData, classe: text})}
              placeholder="Ex: 6ème A"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact parent *</Text>
            <TextInput
              style={styles.input}
              value={formData.contactParent}
              onChangeText={(text) => setFormData({...formData, contactParent: text})}
              placeholder="Numéro de téléphone"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email parent</Text>
            <TextInput
              style={styles.input}
              value={formData.emailParent}
              onChangeText={(text) => setFormData({...formData, emailParent: text})}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date d'inscription</Text>
            <TextInput
              style={styles.input}
              value={formData.dateInscription}
              onChangeText={(text) => setFormData({...formData, dateInscription: text})}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Statut</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.statut}
                onValueChange={(value) => setFormData({...formData, statut: value})}
                style={styles.picker}
              >
                <Picker.Item label="Actif" value="actif" />
                <Picker.Item label="Inactif" value="inactif" />
                <Picker.Item label="Suspendu" value="suspendu" />
              </Picker>
            </View>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  picker: {
    height: 50,
    color: colors.text,
  },
});

export default AddStudentModal;
