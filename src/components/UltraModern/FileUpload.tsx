import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { 
  Text, 
  useTheme, 
  Button, 
  ProgressBar,
  Chip,
  Portal,
  Modal,
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import WebIcon from '../WebIcon';
import { ultraModernStyles } from '../../theme/ultraModern';
import { apiService } from '../../services/api';
import { validateFileUpload, ValidationError } from '../../utils/validation';

interface FileUploadProps {
  onFileUploaded?: (file: any) => void;
  onTextExtracted?: (text: string, filename: string) => void;
  accept?: string[];
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  extractedText?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onTextExtracted,
  accept = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  disabled = false,
}) => {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processingText, setProcessingText] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const simulateProgress = useCallback(() => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  }, []);

  const extractTextFromFile = async (file: any): Promise<string> => {
    setProcessingText(true);
    try {
      // Simulate text extraction - in production, this would use OCR/parsing services
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (file.type === 'text/plain') {
        // For text files, read content directly
        const response = await fetch(file.uri);
        const text = await response.text();
        return text;
      } else if (file.type === 'application/pdf') {
        // Simulate PDF text extraction
        return `Extracted text from PDF: ${file.name}\n\nThis is simulated extracted content. In production, this would use a PDF parsing library to extract actual text content from the uploaded PDF file. The text would include all readable content, tables, and structured data.`;
      } else if (file.type.includes('word')) {
        // Simulate Word document extraction
        return `Extracted text from Word document: ${file.name}\n\nThis is simulated extracted content from a Word document. In production, this would use document parsing libraries to extract the actual content, including formatted text, tables, and other structured elements.`;
      }
      
      return `Content from ${file.name} - text extraction not available for this file type.`;
    } finally {
      setProcessingText(false);
    }
  };

  const handleFileSelect = async () => {
    if (disabled) return;

    try {
      setUploading(true);
      const progressInterval = simulateProgress();

      const result = await DocumentPicker.getDocumentAsync({
        type: accept,
        multiple,
        copyToCacheDirectory: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const files = result.assets;
        
        for (const file of files) {
          // Validate file
          const fileObj = new File([], file.name, { type: file.mimeType || '' });
          Object.defineProperty(fileObj, 'size', { value: file.size || 0 });
          
          const validationErrors = validateFileUpload(fileObj);
          
          if (validationErrors.length > 0) {
            Alert.alert(
              'File Validation Error',
              validationErrors.map(e => e.message).join('\n')
            );
            continue;
          }

          try {
            // Upload file to backend
            const uploadResult = await apiService.uploadFile(fileObj);
            
            const uploadedFile: UploadedFile = {
              id: uploadResult.file.id,
              name: uploadResult.file.original_name,
              size: uploadResult.file.size,
              type: uploadResult.file.content_type,
              uploadedAt: uploadResult.file.uploaded_at,
            };

            // Extract text if it's a supported format
            if (file.mimeType?.includes('text') || file.mimeType?.includes('pdf') || file.mimeType?.includes('word')) {
              try {
                const extractedText = await extractTextFromFile(file);
                uploadedFile.extractedText = extractedText;
                
                if (onTextExtracted) {
                  onTextExtracted(extractedText, file.name);
                }
              } catch (textError) {
                console.warn('Text extraction failed:', textError);
              }
            }

            setUploadedFiles(prev => [...prev, uploadedFile]);
            
            if (onFileUploaded) {
              onFileUploaded(uploadedFile);
            }

          } catch (uploadError) {
            console.error('Upload failed:', uploadError);
            Alert.alert('Upload Error', 'Failed to upload file. Please try again.');
          }
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('File selection error:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handlePreviewFile = (file: UploadedFile) => {
    setSelectedFile(file);
    setPreviewModalVisible(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.includes('pdf')) return 'file-pdf-box';
    if (type.includes('word')) return 'file-word-box';
    if (type.includes('text')) return 'file-document';
    if (type.includes('csv')) return 'file-excel-box';
    return 'file';
  };

  const renderUploadArea = () => (
    <Pressable 
      style={[
        styles.uploadArea,
        dragOver && styles.uploadAreaDragOver,
        disabled && styles.uploadAreaDisabled,
        { 
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: dragOver ? theme.colors.primary : theme.colors.outline,
        }
      ]}
      onPress={handleFileSelect}
      disabled={disabled || uploading}
    >
      <View style={[styles.uploadIcon, { backgroundColor: theme.colors.surfaceContainer }]}>
        <WebIcon 
          name={uploading ? "loading" : "cloud-upload"} 
          size={32} 
          color={disabled ? theme.colors.onSurfaceVariant : theme.colors.primary} 
        />
      </View>
      
      <Text 
        variant="titleMedium" 
        style={[
          styles.uploadTitle,
          { color: disabled ? theme.colors.onSurfaceVariant : theme.colors.onSurface }
        ]}
      >
        {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
      </Text>
      
      <Text 
        variant="bodyMedium" 
        style={[styles.uploadSubtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Support for PDF, DOC, TXT and CSV files (max {Math.round(maxSize / 1024 / 1024)}MB)
      </Text>

      {uploading && (
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={uploadProgress / 100} 
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {Math.round(uploadProgress)}% uploaded
          </Text>
        </View>
      )}
    </Pressable>
  );

  const renderUploadedFiles = () => (
    <View style={styles.uploadedFiles}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        📎 Uploaded Files ({uploadedFiles.length})
      </Text>
      
      {uploadedFiles.map((file) => (
        <View 
          key={file.id} 
          style={[
            styles.fileCard,
            ultraModernStyles.ultraCard,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <View style={styles.fileHeader}>
            <View style={styles.fileInfo}>
              <WebIcon 
                name={getFileIcon(file.type)} 
                size={24} 
                color={theme.colors.primary} 
              />
              <View style={styles.fileDetails}>
                <Text 
                  variant="titleSmall" 
                  style={{ color: theme.colors.onSurface }}
                  numberOfLines={1}
                >
                  {file.name}
                </Text>
                <Text 
                  variant="bodySmall" 
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <View style={styles.fileActions}>
              {file.extractedText && (
                <Button
                  mode="text"
                  onPress={() => handlePreviewFile(file)}
                  compact
                  icon="eye"
                >
                  Preview
                </Button>
              )}
              <Button
                mode="text"
                onPress={() => handleRemoveFile(file.id)}
                textColor={theme.colors.error}
                compact
                icon="delete"
              >
                Remove
              </Button>
            </View>
          </View>

          {file.extractedText && (
            <View style={styles.extractedTextPreview}>
              <Chip 
                mode="outlined"
                compact
                style={styles.textExtractedChip}
                textStyle={{ color: theme.colors.success, fontSize: 11 }}
                icon={() => <WebIcon name="check-circle" size={12} color={theme.colors.success} />}
              >
                Text Extracted
              </Chip>
              <Text 
                variant="bodySmall" 
                style={[styles.textPreview, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={2}
              >
                {file.extractedText.substring(0, 100)}...
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderPreviewModal = () => (
    <Portal>
      <Modal
        visible={previewModalVisible}
        onDismiss={() => setPreviewModalVisible(false)}
        contentContainerStyle={[
          styles.modalContent,
          ultraModernStyles.ultraCard,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        {selectedFile && (
          <>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleSection}>
                <WebIcon 
                  name={getFileIcon(selectedFile.type)} 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                  {selectedFile.name}
                </Text>
              </View>
              <Button
                mode="text"
                onPress={() => setPreviewModalVisible(false)}
                icon="close"
              >
                Close
              </Button>
            </View>

            <View style={styles.modalBody}>
              <Text variant="titleMedium" style={[styles.modalSectionTitle, { color: theme.colors.onSurface }]}>
                Extracted Text Content
              </Text>
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.extractedTextContent, 
                  { 
                    color: theme.colors.onSurface,
                    backgroundColor: theme.colors.surfaceVariant 
                  }
                ]}
              >
                {selectedFile.extractedText || 'No text content available'}
              </Text>
              
              <Button
                mode="contained"
                onPress={() => {
                  if (selectedFile.extractedText && onTextExtracted) {
                    onTextExtracted(selectedFile.extractedText, selectedFile.name);
                  }
                  setPreviewModalVisible(false);
                }}
                style={[ultraModernStyles.primaryButton, { marginTop: 16 }]}
                icon="import"
              >
                Use This Text for Analysis
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderUploadArea()}
      
      {processingText && (
        <View style={[styles.processingContainer, { backgroundColor: theme.colors.surfaceContainer }]}>
          <ProgressBar indeterminate color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
            Extracting text content...
          </Text>
        </View>
      )}
      
      {uploadedFiles.length > 0 && renderUploadedFiles()}
      {renderPreviewModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: ultraModernStyles.spacing.lg,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: ultraModernStyles.radius.lg,
    padding: ultraModernStyles.spacing.xxl,
    alignItems: 'center',
    gap: ultraModernStyles.spacing.md,
  },
  uploadAreaDragOver: {
    borderStyle: 'solid',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  uploadAreaDisabled: {
    opacity: 0.6,
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: ultraModernStyles.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    textAlign: 'center',
    fontWeight: '600',
  },
  uploadSubtitle: {
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    gap: ultraModernStyles.spacing.sm,
    marginTop: ultraModernStyles.spacing.md,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  processingContainer: {
    padding: ultraModernStyles.spacing.lg,
    borderRadius: ultraModernStyles.radius.lg,
    gap: ultraModernStyles.spacing.sm,
  },
  uploadedFiles: {
    gap: ultraModernStyles.spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  fileCard: {
    padding: ultraModernStyles.spacing.md,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
    flex: 1,
  },
  fileDetails: {
    flex: 1,
  },
  fileActions: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.sm,
  },
  extractedTextPreview: {
    marginTop: ultraModernStyles.spacing.md,
    gap: ultraModernStyles.spacing.sm,
  },
  textExtractedChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  textPreview: {
    fontStyle: 'italic',
    lineHeight: 16,
  },
  modalContent: {
    margin: ultraModernStyles.spacing.lg,
    padding: ultraModernStyles.spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ultraModernStyles.spacing.lg,
  },
  modalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
    flex: 1,
  },
  modalBody: {
    gap: ultraModernStyles.spacing.md,
  },
  modalSectionTitle: {
    fontWeight: '600',
  },
  extractedTextContent: {
    padding: ultraModernStyles.spacing.md,
    borderRadius: ultraModernStyles.radius.md,
    minHeight: 200,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default FileUpload;