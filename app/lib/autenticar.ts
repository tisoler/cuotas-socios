import Cookies from 'js-cookie';

export const getToken = () => {
  return Cookies.get('token');
};

export const setToken = (token: string) => {
  Cookies.set('token', token, { expires: 7 });
};

export const removeToken = () => {
  Cookies.remove('token');
};

export const validateToken = async (token: string) => {
  const response = await fetch('/api/autenticar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data.usuario; // Devuelve la información del usuario si el token es válido
  }

  return null;
};
