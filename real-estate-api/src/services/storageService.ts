import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  private static BUCKET_NAME = 'real-estate-uploads';

  /**
   * Sube un archivo a Supabase Storage y retorna la URL pública
   */
  static async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('[StorageService] Error subiendo archivo:', error);
      throw new Error('No se pudo subir la imagen a la nube');
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  /**
   * Elimina un archivo de Supabase Storage mediante su URL
   */
  static async deleteFile(url: string): Promise<void> {
    try {
      // Extraer el path relativo de la URL pública de Supabase
      // Formato típico: https://xxx.supabase.co/storage/v1/object/public/bucket-name/folder/file.jpg
      const parts = url.split(`${this.BUCKET_NAME}/`);
      if (parts.length < 2) return;
      
      const filePath = parts[1];
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('[StorageService] Error eliminando archivo:', error);
      }
    } catch (err) {
      console.error('[StorageService] Error procesando eliminación:', err);
    }
  }
}
