import React, { useState, useCallback, memo, useMemo } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, TouchableOpacity, FlatList, Switch, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Document, Traveler } from "../types/bookingTypes";
import InputWithValidation from './InputWithValidation';
import DocumentTypeIcon from './DocumentTypeIcon';
import { useTheme } from '@/app/context/ThemeContext';
import { useThemeColor } from '@/components/Themed';
import { validatePasportExpiryDate, validateCountryCode } from './../utils/validationHelpers';

interface DocumentModalProps {
    traveler: Traveler;
    index: number;
    onSave: (documents: Document[]) => void;
    onClose: () => void;
    visible: boolean;
}

const DocumentModal: React.FC<DocumentModalProps> = ({
    traveler,
    index,
    onSave,
    onClose,
    visible,
}) => {
    const { theme } = useTheme();
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const surfaceColor = useThemeColor({}, 'surface');
    const highlightColor = useThemeColor({}, 'highlight');
    const borderColor = useThemeColor({}, 'border');
    const secondaryColor = useThemeColor({}, 'secondary');
    const dangerColor = useThemeColor({}, 'error');
    const placeholderColor = useThemeColor({}, 'placeholder');

    const [localDocuments, setLocalDocuments] = useState(traveler.documents);
    const [localDatePickerVisible, setLocalDatePickerVisible] = useState(false);
    const [docTypePickerVisible, setDocTypePickerVisible] = useState(false);
    const [activeDocumentIndex, setActiveDocumentIndex] = useState(0);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const handleDocChange = useCallback((docIndex: number, field: string, value: string | boolean) => {
        setLocalDocuments(prev => {
            const newDocs = [...prev];
            newDocs[docIndex] = { ...newDocs[docIndex], [field]: value };
            return newDocs;
        });

        const errorKey = `doc${docIndex}_${field}`;
        if (localErrors[errorKey]) {
            const newErrors = { ...localErrors };
            delete newErrors[errorKey];
            setLocalErrors(newErrors);
        }
    }, [localErrors]);

    const addDocument = useCallback(() => {
        setLocalDocuments(prev => [
            ...prev,
            {
                documentType: 'PASSPORT',
                number: '',
                expiryDate: '',
                issuanceCountry: '',
                validityCountry: '',
                nationality: '',
                holder: true
            }
        ]);
        setActiveDocumentIndex(localDocuments.length);
    }, [localDocuments.length]);

    const removeDocument = useCallback((index: number) => {
        if (localDocuments.length <= 1) {
            Alert.alert('Cannot Remove', 'At least one document is required');
            return;
        }

        setLocalDocuments(prev => prev.filter((_, i) => i !== index));
        if (activeDocumentIndex >= index) {
            setActiveDocumentIndex(Math.max(0, activeDocumentIndex - 1));
        }
    }, [localDocuments.length, activeDocumentIndex]);

    const validateDocument = (doc: Document, index: number) => {
        const docErrors: Record<string, string> = {};

        if (!doc.number) {
            docErrors[`doc${index}_number`] = 'Document number is required';
        }

        if (!doc.expiryDate || !validatePasportExpiryDate(doc.expiryDate)) {
            docErrors[`doc${index}_expiry`] = 'Valid expiry date is required';
        }

        if (!validateCountryCode(doc.issuanceCountry)) {
            docErrors[`doc${index}_issuanceCountry`] = 'Valid 2-letter country code required';
        }

        if (!validateCountryCode(doc.validityCountry)) {
            docErrors[`doc${index}_validityCountry`] = 'Valid 2-letter country code required';
        }

        if (!validateCountryCode(doc.nationality)) {
            docErrors[`doc${index}_nationality`] = 'Valid 2-letter country code required';
        }

        return docErrors;
    };

    const handleSave = useCallback(() => {
        let hasErrors = false;
        const newErrors: Record<string, string> = {};

        localDocuments.forEach((doc, index) => {
            const docErrors = validateDocument(doc, index);
            if (Object.keys(docErrors).length > 0) {
                hasErrors = true;
                Object.assign(newErrors, docErrors);
            }
        });

        if (hasErrors) {
            setLocalErrors(newErrors);
            Alert.alert('Validation Error', 'Please fill all required document fields correctly');
            return;
        }

        onSave([...localDocuments]);
        onClose();
    }, [localDocuments, onSave, onClose]);

    const inputStyle = useMemo(() => [
        styles.input,
        {
            borderColor: borderColor,
            backgroundColor: surfaceColor
        }
    ], [borderColor, surfaceColor]);

    const errorTextStyle = useMemo(() => ({
        color: dangerColor,
        fontSize: 12,
        marginBottom: 8,
    }), [dangerColor]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            transparent={false}
        >
            <View style={[styles.modalContainer, { backgroundColor }]}>
                <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color={highlightColor}
                        onPress={onClose}
                    />
                    <Text style={[styles.modalTitle, { color: textColor }]}>
                        Documents for {traveler.name.firstName || `Traveler ${index + 1}`}
                    </Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={{ color: highlightColor }}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.modalContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.docSelector}>
                        <FlatList
                            horizontal
                            data={localDocuments}
                            keyExtractor={(_, i) => i.toString()}
                            renderItem={({ item, index: i }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.docTab,
                                        activeDocumentIndex === i && styles.docTabActive,
                                        {
                                            borderColor: highlightColor,
                                            backgroundColor: activeDocumentIndex === i ? highlightColor : 'transparent'
                                        }
                                    ]}
                                    onPress={() => setActiveDocumentIndex(i)}
                                >
                                    <DocumentTypeIcon
                                        type={item.documentType}
                                        color={activeDocumentIndex === i ? surfaceColor : highlightColor}
                                    />
                                    <Text style={[
                                        styles.docTabText,
                                        { color: activeDocumentIndex === i ? surfaceColor : highlightColor }
                                    ]}>
                                        Doc {i + 1}
                                    </Text>
                                    {localDocuments.length > 1 && (
                                        <MaterialIcons
                                            name="close"
                                            size={16}
                                            color={activeDocumentIndex === i ? surfaceColor : highlightColor}
                                            onPress={() => removeDocument(i)}
                                            style={styles.docTabClose}
                                        />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListFooterComponent={() => (
                                <TouchableOpacity
                                    style={[styles.docTab, { borderColor: highlightColor }]}
                                    onPress={addDocument}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="add" size={20} color={highlightColor} />
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.docSelectorContent}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>

                    {localDocuments[activeDocumentIndex] && (
                        <View style={styles.documentForm}>
                            <Text style={[styles.label, { color: textColor }]}>Document Type</Text>
                            <TouchableOpacity
                                style={inputStyle}
                                onPress={() => setDocTypePickerVisible(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: localDocuments[activeDocumentIndex].documentType ? textColor : placeholderColor }}>
                                    {localDocuments[activeDocumentIndex].documentType === 'PASSPORT' ? 'Passport' : 'ID Card'}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={20} color={secondaryColor} />
                            </TouchableOpacity>

                            {docTypePickerVisible && (
                                <View style={[
                                    styles.docTypePicker,
                                    {
                                        backgroundColor: surfaceColor,
                                        shadowColor: theme === 'light' ? '#000' : 'transparent',
                                        elevation: theme === 'light' ? 2 : 0,
                                    }
                                ]}>
                                    <TouchableOpacity
                                        style={styles.docTypeOption}
                                        onPress={() => {
                                            handleDocChange(activeDocumentIndex, 'documentType', 'PASSPORT');
                                            setDocTypePickerVisible(false);
                                        }}
                                    >
                                        <Text style={{ color: textColor }}>Passport</Text>
                                    </TouchableOpacity>
                                    <View style={[styles.divider, { backgroundColor: borderColor }]} />
                                    <TouchableOpacity
                                        style={styles.docTypeOption}
                                        onPress={() => {
                                            handleDocChange(activeDocumentIndex, 'documentType', 'ID_CARD');
                                            setDocTypePickerVisible(false);
                                        }}
                                    >
                                        <Text style={{ color: textColor }}>ID Card</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <InputWithValidation
                                label="Document Number *"
                                placeholder="Enter document number *"
                                value={localDocuments[activeDocumentIndex].number}
                                onChangeText={(text: string) => handleDocChange(activeDocumentIndex, 'number', text)}
                                autoCapitalize="characters"
                                returnKeyType="next"
                                error={localErrors[`doc${activeDocumentIndex}_number`]}
                                highlightColor={highlightColor}
                                textColor={textColor}
                                borderColor={borderColor}
                                surfaceColor={surfaceColor}
                                dangerColor={dangerColor}
                                placeholderColor={placeholderColor}
                            />

                            <Text style={[styles.label, { color: textColor }]}>Expiry Date *</Text>
                            <TouchableOpacity
                                style={[
                                    inputStyle,
                                    localErrors[`doc${activeDocumentIndex}_expiry`] && { borderColor: dangerColor }
                                ]}
                                onPress={() => setLocalDatePickerVisible(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: localDocuments[activeDocumentIndex].expiryDate ? textColor : placeholderColor }}>
                                    {localDocuments[activeDocumentIndex].expiryDate || 'Select expiry date *'}
                                </Text>
                                <MaterialIcons name="calendar-today" size={18} color={secondaryColor} />
                            </TouchableOpacity>
                            {localErrors[`doc${activeDocumentIndex}_expiry`] && (
                                <Text style={errorTextStyle}>{localErrors[`doc${activeDocumentIndex}_expiry`]}</Text>
                            )}

                            <DateTimePickerModal
                                isVisible={localDatePickerVisible}
                                mode="date"
                                minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
                                onConfirm={(date) => {
                                    // Format directly to ISO (YYYY-MM-DD)
                                    const isoDate = date.toISOString().split('T')[0];
                                    handleDocChange(activeDocumentIndex, 'expiryDate', isoDate);
                                    setLocalDatePickerVisible(false);
                                }}
                                onCancel={() => setLocalDatePickerVisible(false)}
                            />



                            <InputWithValidation
                                label="Issuance Country *"
                                placeholder="Country code (e.g., ES) *"
                                value={localDocuments[activeDocumentIndex].issuanceCountry}
                                onChangeText={(text: string) => handleDocChange(activeDocumentIndex, 'issuanceCountry', text.toUpperCase())}
                                autoCapitalize="characters"
                                maxLength={2}
                                returnKeyType="next"
                                error={localErrors[`doc${activeDocumentIndex}_issuanceCountry`]}
                                highlightColor={highlightColor}
                                textColor={textColor}
                                borderColor={borderColor}
                                surfaceColor={surfaceColor}
                                dangerColor={dangerColor}
                                placeholderColor={placeholderColor}
                            />

                            <InputWithValidation
                                label="Validity Country *"
                                placeholder="Country code (e.g., ES) *"
                                value={localDocuments[activeDocumentIndex].validityCountry}
                                onChangeText={(text: string) => handleDocChange(activeDocumentIndex, 'validityCountry', text.toUpperCase())}
                                autoCapitalize="characters"
                                maxLength={2}
                                returnKeyType="next"
                                error={localErrors[`doc${activeDocumentIndex}_validityCountry`]}
                                highlightColor={highlightColor}
                                textColor={textColor}
                                borderColor={borderColor}
                                surfaceColor={surfaceColor}
                                dangerColor={dangerColor}
                                placeholderColor={placeholderColor}
                            />

                            <InputWithValidation
                                label="Nationality *"
                                placeholder="Country code (e.g., ES) *"
                                value={localDocuments[activeDocumentIndex].nationality}
                                onChangeText={(text: string) => handleDocChange(activeDocumentIndex, 'nationality', text.toUpperCase())}
                                autoCapitalize="characters"
                                maxLength={2}
                                returnKeyType="done"
                                error={localErrors[`doc${activeDocumentIndex}_nationality`]}
                                highlightColor={highlightColor}
                                textColor={textColor}
                                borderColor={borderColor}
                                surfaceColor={surfaceColor}
                                dangerColor={dangerColor}
                                placeholderColor={placeholderColor}
                            />

                            <View style={[styles.holderContainer, { borderColor }]}>
                                <Text style={{ color: textColor }}>Document Holder</Text>
                                <Switch
                                    value={localDocuments[activeDocumentIndex].holder || false}
                                    onValueChange={(value) => handleDocChange(activeDocumentIndex, 'holder', value)}
                                    trackColor={{ false: borderColor, true: highlightColor }}
                                    thumbColor={surfaceColor}
                                />
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            {
                                backgroundColor: highlightColor,
                                shadowColor: theme === 'light' ? '#000' : 'transparent',
                                elevation: theme === 'light' ? 2 : 0,
                            }
                        ]}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Save Documents</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        paddingTop: 50,
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 8,
    },
    modalContent: {
        padding: 16,
        paddingBottom: 32,
    },
    docSelector: {
        marginBottom: 16,
    },
    docSelectorContent: {
        paddingVertical: 4,
    },
    docTab: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    docTabActive: {
        borderWidth: 1,
    },
    docTabText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
        marginRight: 4,
    },
    docTabClose: {
        marginLeft: 4,
    },
    documentForm: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    docTypePicker: {
        position: 'absolute',
        top: 100,
        left: 16,
        right: 16,
        borderRadius: 8,
        zIndex: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    docTypeOption: {
        padding: 16,
    },
    divider: {
        height: 1,
        width: '100%',
    },
    holderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        marginTop: 12,
    },
    primaryButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default memo(DocumentModal);