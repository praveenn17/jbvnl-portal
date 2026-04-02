
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginTab from './LoginTab';
import RegisterTab from './RegisterTab';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  return (
    <div className="max-w-md mx-auto">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/30 p-1 border border-white/5 rounded-xl h-12 mb-6">
          <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all h-full text-sm font-medium">Login</TabsTrigger>
          <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary data-[state=active]:shadow-[0_0_15px_rgba(var(--secondary),0.3)] transition-all h-full text-sm font-medium">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <LoginTab onSuccess={onSuccess} />
        </TabsContent>

        <TabsContent value="register">
          <RegisterTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoginForm;
