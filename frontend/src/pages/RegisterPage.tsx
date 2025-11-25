import { Box, Typography, TextField, Button, Container, CssBaseline, Paper, Alert, Link } from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { UserPlus } from 'lucide-react';

type RegisterFormInputs = {
  name: string;
  email: string;
  password: string;
};

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>();
  const navigate = useNavigate();
  
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setRegisterError(null);
    setRegisterSuccess(null);

    try {
      await axios.post('http://localhost:3000/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      setRegisterSuccess("Cadastro realizado com sucesso! Redirecionando...");
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error("Erro no registro:", error);
      if (axios.isAxiosError(error) && error.response) {
        const msg = error.response.data?.message || "E-mail já cadastrado ou dados inválidos.";
        setRegisterError(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        setRegisterError("Erro ao tentar registrar. Tente novamente.");
      }
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb' 
      }}
    >
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Paper 
          elevation={0} 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 4,
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: 3
          }}
        >
          {/* Ícone Centralizado */}
          <Box sx={{ 
            backgroundColor: '#e8f5e9', 
            p: 2, 
            borderRadius: '50%', 
            mb: 2,
            color: '#1B5E20',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <UserPlus size={40} strokeWidth={1.5} />
          </Box>

          {/* Título Centralizado */}
          <Typography component="h1" variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
            Criar Nova Conta
          </Typography>
          
          {/* Formulário: Substituímos Grid por Flex Column com Gap */}
          <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)} 
            noValidate 
            sx={{ 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2 // Espaçamento uniforme entre todos os campos
            }}
          >
            
            {registerError && (
              <Alert severity="error">{registerError}</Alert>
            )}
            {registerSuccess && (
              <Alert severity="success">{registerSuccess}</Alert>
            )}

            <TextField
              required
              fullWidth
              id="name"
              label="Nome Completo"
              autoFocus
              {...register("name", { required: "Nome é obrigatório" })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              required
              fullWidth
              id="email"
              label="Endereço de E-mail"
              autoComplete="email"
              {...register("email", { 
                required: "E-mail é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Endereço de e-mail inválido"
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              required
              fullWidth
              label="Senha"
              type="password"
              id="password"
              {...register("password", { 
                required: "Senha é obrigatória",
                minLength: {
                  value: 6,
                  message: "A senha deve ter pelo menos 6 caracteres"
                }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ py: 1.2, borderRadius: 2, mt: 1 }}
            >
              Cadastrar
            </Button>
            
            {/* Link Centralizado para harmonizar com o resto */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link component={RouterLink} to="/login" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500 }}>
                Já tem uma conta? <span style={{ color: '#1B5E20', fontWeight: 'bold' }}>Faça login</span>
              </Link>
            </Box>

          </Box>
        </Paper>
      </Container>
    </Box>
  );
}