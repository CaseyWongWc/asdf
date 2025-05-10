import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ChatConsole from "./components/ChatConsole";

// Create a simple console page
function ConsolePage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-bold">GPT Bash Console</h1>
        <Link href="/">
          <a className="text-blue-400 hover:underline">Back to Graph Editor</a>
        </Link>
      </div>
      <div className="flex-1 p-4">
        <ChatConsole />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/console" component={ConsolePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
