import * as jwt from 'jsonwebtoken';

console.log('JWT object:', jwt);
console.log('JWT sign function exists:', typeof jwt.sign);

try {
  const token = jwt.sign({ userId: '123' }, 'secret', { expiresIn: '1h' });
  console.log('Token generated successfully:', token);
} catch (error) {
  console.error('Error generating token:', error);
}