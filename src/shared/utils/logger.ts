import { supabase } from '@/shared/services/supabase';

type LogType = 'error' | 'admin_activity' | 'file_upload';

/**
 * Inserta un log en la base de datos de Supabase.
 * @param logType El tipo de log ('error' | 'admin_activity' | 'file_upload')
 * @param message El mensaje descriptivo del log
 * @param details Objeto opcional con detalles adicionales
 */
export async function insertLog(logType: LogType, message: string, details?: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('logs').insert([{
      log_type: logType,
      message: message,
      details: details ? JSON.stringify(details) : null,
      user_id: user?.id || null,
    }]);
  } catch (error) {
    console.error('Error insertando log:', error);
  }
}
