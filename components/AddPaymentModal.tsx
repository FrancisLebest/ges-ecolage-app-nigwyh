
import React, { useState, useEffect } from 'react';
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
import { Payment } from '../types';
import { Picker } from '@react-native-picker/picker';
import { useSupabaseStudents } from '../hooks/useSupabaseStudents';
import { useSupabaseFees } from '../hooks/useSupabaseFees';
import { useAuth } from '../hooks/useAuth';

interface AddPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payment: Payment) => Promise<void>;
  prefilledMatricule?: string;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  visible,
  onClose,
  onSave,
  prefilledMatricule
}) => {
  const { students } = useSupabaseStudents();
  const { fees } = useSupabaseFees();
  const { user } = useAuth();

  const [formData, setFormData] = useState<Payment>({
    id: '',
    datePaiement: new Date().toISOString().split('T')[0],
    matricule: prefilledMatricule || '',
    codeFrais: '',
    montantPaye: 0,
    mode: 'especes',
    numPiece: '',
    caissier: user?.username || '',
    commentaires: ''
  });

  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedFee, setSelectedFee] = useState<any>(null);

  useEffect(() => {
    if (prefilledMatricule) {
      const student = students.find(s => s.matricule === prefilledMatricule);
      setSelectedStudent(student);
      setFormData(prev => ({ ...prev, matricule: prefilledMatricule }));
    }
  }, [prefilledMatricule, students]);

  useEffect(() => {
    if (formData.matricule) {
      const student = students.find(s => s.matricule === formData.matricule);
      setSelectedStudent(student);
    }
  }, [formData.matricule, students]);

  useEffect(() => {
    if (formData.codeFrais) {
      const fee = fees.find(f => f.code === formData.codeFrais);
      setSelectedFee(fee);
      if (fee && formData.montantPaye === 0) {
        setFormData(prev => ({ ...prev, montantPaye: fee.montant }));
      }
    }
  }, [formData.codeFrais, fees]);

  const handleSave = async () => {
    // Validation
    if (!formData.matricule.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner un élève');
      return;
    }
    if (!formData.codeFrais.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner un frais');
      return;
    }
    if (formData.montantPaye <= 0) {
      Alert.alert('Erreur', 'Le montant doit être supérieur à 0');
      return;
    }

    try {
      setLoading(true);
      const paymentToSave = {
        ...formData,
        id: Date.now().toString() // Generate a simple ID
      };
      await onSave(paymentToSave);
      onClose();
      // Reset form
      setFormData({
        id: '',
        datePaiement: new Date().toISOString().split('T')[0],
        matricule: prefilledMatricule || '',
        codeFrais: '',
        montantPaye: 0,
        mode: 'especes',
        numPiece: '',
        caissier: user?.username || '',
        commentaires: ''
      });
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la sauvegarde: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
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
          <Text style={styles.title}>Enregistrer un paiement</Text>
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
            <Text style={styles.label}>Date de paiement *</Text>
            <TextInput
              style={styles.input}
              value={formData.datePaiement}
              onChangeText={(text) => setFormData({...formData, datePaiement: text})}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Élève *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.matricule}
                onValueChange={(value) => setFormData({...formData, matricule: value})}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionner un élève" value="" />
                {students.map(student => (
                  <Picker.Item 
                    key={student.matricule}
                    label={`${student.matricule} - ${student.nom} ${student.prenom} (${student.classe})`}
                    value={student.matricule}
                  />
                ))}
              </Picker>
            </View>
            {selectedStudent && (
              <View style={styles.studentInfo}>
                <Text style={styles.studentInfoText}>
                  {selectedStudent.nom} {selectedStudent.prenom} - {selectedStudent.classe}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frais *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.codeFrais}
                onValueChange={(value) => setFormData({...formData, codeFrais: value})}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionner un frais" value="" />
                {fees.map(fee => (
                  <Picker.Item 
                    key={fee.code}
                    label={`${fee.code} - ${fee.description} (${formatCurrency(fee.montant)})`}
                    value={fee.code}
                  />
                ))}
              </Picker>
            </View>
            {selectedFee && (
              <View style={styles.feeInfo}>
                <Text style={styles.feeInfoText}>
                  Montant du frais: {formatCurrency(selectedFee.montant)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Montant payé (FCFA) *</Text>
            <TextInput
              style={styles.input}
              value={formData.montantPaye.toString()}
              onChangeText={(text) => {
                const amount = parseFloat(text) || 0;
                setFormData({...formData, montantPaye: amount});
              }}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mode de paiement *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.mode}
                onValueChange={(value) => setFormData({...formData, mode: value})}
                style={styles.picker}
              >
                <Picker.Item label="Espèces" value="especes" />
                <Picker.Item label="Chèque" value="cheque" />
                <Picker.Item label="Virement" value="virement" />
                <Picker.Item label="Mobile Money" value="mobile" />
              </Picker>
            </View>
          </View>

          {(formData.mode === 'cheque' || formData.mode === 'virement' || formData.mode === 'mobile') && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de pièce</Text>
              <TextInput
                style={styles.input}
                value={formData.numPiece}
                onChangeText={(text) => setFormData({...formData, numPiece: text})}
                placeholder={
                  formData.mode === 'cheque' ? 'Numéro de chèque' :
                  formData.mode === 'virement' ? 'Référence virement' :
                  'Référence transaction'
                }
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Commentaires</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.commentaires}
              onChangeText={(text) => setFormData({...formData, commentaires: text})}
              placeholder="Commentaires optionnels"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Caissier</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.caissier}
              editable={false}
            />
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
  disabledInput: {
    backgroundColor: colors.border + '30',
    color: colors.textSecondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  studentInfo: {
    backgroundColor: colors.primary + '10',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  studentInfoText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  feeInfo: {
    backgroundColor: colors.success + '10',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  feeInfoText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
});

export default AddPaymentModal;
