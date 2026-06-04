import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/shared/services/supabase';

// Sección: Este archivo maneja todo el estado global de la sesión del usuario conectándose a Supabase para saber si está logueado o no

// Funciones: useAuth sirve para escuchar los cambios de sesión en tiempo real y darnos acceso a los datos del usuario en cualquier parte de la aplicación

// Exportamos nuestro hook personalizado de autenticación
export function useSessionAuth() {
  // Creamos un estado para guardar toda la información del usuario (su correo, id, etc)
  const [user, setUser] = useState<User | null>(null);
  // Creamos un estado para guardar los datos de la sesión actual (tokens de acceso)
  const [session, setSession] = useState<Session | null>(null);
  // Creamos un estado para saber si la app todavía está comprobando la sesión (para mostrar pantallas de carga)
  const [loading, setLoading] = useState(true);

  // Usamos useEffect para que todo este código de verificación corra ni bien arranque la aplicación
  useEffect(() => {
    // Le pedimos a Supabase que nos traiga la sesión actual que tiene guardada
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      // Guardamos la sesión encontrada en nuestro estado
      setSession(session);
      // Guardamos al usuario de esa sesión (si existe lo guardamos, si no ponemos nulo)
      setUser(session?.user ?? null);
      // Terminamos el proceso de carga cambiando el estado a falso
      setLoading(false);
    }).catch((err) => {
      console.warn('Error al obtener sesión (posible falla de red):', err.message);
      setLoading(false);
    });

    // Nos suscribimos a Supabase para que nos avise cada vez que el usuario inicie sesión, cierre sesión o cambie algo
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      // Si hay un cambio actualizamos nuestra sesión guardada
      setSession(session);
      // También actualizamos la información del usuario
      setUser(session?.user ?? null);
      // Quitamos el estado de carga por si acaso
      setLoading(false);
    });

    // Cuando el componente se destruya cancelamos la suscripción para no gastar recursos del celular ni memoria
    return () => subscription.unsubscribe();
  // El arreglo vacío hace que esto se configure una sola vez al inicio
  }, []);

  // Al final retornamos el usuario, la sesión y el estado de carga para usarlos en nuestras pantallas
  return { user, session, loading };
}

// si quitas useAuth pasa que la aplicación entera dejará de saber si estás logueado o no y no podrás proteger tus pantallas ni mostrar los datos de la cuenta del usuario
