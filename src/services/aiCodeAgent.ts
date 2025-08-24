
import { geminiService } from './geminiService';

export interface CodeProject {
  id: string;
  name: string;
  description: string;
  files: ProjectFile[];
  architecture: string[];
  dependencies: string[];
  status: 'generating' | 'complete' | 'error';
}

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
  type: 'component' | 'page' | 'service' | 'utility' | 'config' | 'backend';
}

export interface GenerationTask {
  id: string;
  prompt: string;
  context: string;
  priority: number;
  dependencies: string[];
}

class AICodeAgent {
  private currentProject: CodeProject | null = null;
  private generationQueue: GenerationTask[] = [];
  private isGenerating = false;

  async generateCompleteApplication(prompt: string, onProgress?: (update: string) => void): Promise<CodeProject> {
    this.isGenerating = true;
    
    const project: CodeProject = {
      id: Date.now().toString(),
      name: this.extractProjectName(prompt),
      description: prompt,
      files: [],
      architecture: [],
      dependencies: [],
      status: 'generating'
    };

    this.currentProject = project;

    try {
      // Phase 1: Project Architecture Planning
      onProgress?.('🏗️ Planning project architecture...');
      const architecture = await this.planArchitecture(prompt);
      project.architecture = architecture.components;
      project.dependencies = architecture.dependencies;

      // Phase 2: Generate Core Files
      onProgress?.('⚡ Generating core application files...');
      const coreFiles = await this.generateCoreFiles(prompt, architecture);
      project.files.push(...coreFiles);

      // Phase 3: Generate Components
      onProgress?.('🎨 Creating UI components...');
      const components = await this.generateComponents(prompt, architecture);
      project.files.push(...components);

      // Phase 4: Generate Services & Backend
      onProgress?.('🔧 Setting up services and backend logic...');
      const services = await this.generateServices(prompt, architecture);
      project.files.push(...services);

      // Phase 5: Generate Utils & Hooks
      onProgress?.('🛠️ Adding utilities and custom hooks...');
      const utilities = await this.generateUtilities(prompt, architecture);
      project.files.push(...utilities);

      // Phase 6: Generate Configuration
      onProgress?.('⚙️ Finalizing configuration files...');
      const config = await this.generateConfiguration(architecture);
      project.files.push(...config);

      project.status = 'complete';
      onProgress?.('✅ Application generated successfully!');
      
    } catch (error) {
      project.status = 'error';
      onProgress?.(`❌ Error: ${error}`);
      throw error;
    } finally {
      this.isGenerating = false;
    }

    return project;
  }

  private async planArchitecture(prompt: string) {
    const architecturePrompt = `
ARCHITECTURE PLANNING FOR: ${prompt}

You are an expert software architect. Analyze this project request and create a comprehensive architecture plan.

Return a JSON response with this structure:
{
  "components": ["list of main components needed"],
  "dependencies": ["list of npm packages required"],
  "features": ["list of key features to implement"],
  "backend": ["list of backend services needed"],
  "database": ["database schema requirements"]
}

Focus on:
- Modern React patterns with TypeScript
- Scalable component architecture  
- Proper separation of concerns
- Integration-ready backend services
- Real-time features where applicable
- Mobile-responsive design
- Authentication and authorization
- Data management and caching

RETURN ONLY VALID JSON - NO OTHER TEXT
`;

    const response = await geminiService.generateResponse(architecturePrompt);
    try {
      return JSON.parse(response);
    } catch {
      return {
        components: ['App', 'Header', 'Main', 'Footer'],
        dependencies: ['react', 'typescript', 'tailwindcss'],
        features: ['responsive-design', 'modern-ui'],
        backend: ['api-routes'],
        database: ['user-data']
      };
    }
  }

  private async generateCoreFiles(prompt: string, architecture: any): Promise<ProjectFile[]> {
    const files: ProjectFile[] = [];

    // Generate main App.tsx
    const appPrompt = `
CREATE MAIN APPLICATION FILE FOR: ${prompt}

Generate a complete, production-ready App.tsx file with:
- Router setup with all necessary routes
- Authentication provider integration
- Theme/context providers
- Error boundaries
- Loading states
- Modern React patterns
- Full TypeScript typing
- Responsive layout structure

Architecture context: ${JSON.stringify(architecture)}

Generate ONLY the complete App.tsx code - no explanations.
`;

    const appCode = await geminiService.generateResponse(appPrompt);
    files.push({
      path: 'src/App.tsx',
      content: this.extractCodeFromResponse(appCode),
      language: 'typescript',
      type: 'component'
    });

    // Generate main layout
    const layoutPrompt = `
CREATE MAIN LAYOUT COMPONENT FOR: ${prompt}

Generate a complete Layout.tsx component with:
- Responsive navigation
- Header with branding/user menu
- Sidebar if needed
- Main content area
- Footer
- Mobile-optimized design
- Dark/light theme support
- Accessibility features

Architecture: ${JSON.stringify(architecture)}

Generate ONLY the complete Layout.tsx code.
`;

    const layoutCode = await geminiService.generateResponse(layoutPrompt);
    files.push({
      path: 'src/components/Layout.tsx',
      content: this.extractCodeFromResponse(layoutCode),
      language: 'typescript',
      type: 'component'
    });

    return files;
  }

  private async generateComponents(prompt: string, architecture: any): Promise<ProjectFile[]> {
    const files: ProjectFile[] = [];
    const componentPrompts = this.getComponentPrompts(prompt, architecture);

    for (const [name, componentPrompt] of Object.entries(componentPrompts)) {
      try {
        const code = await geminiService.generateResponse(componentPrompt);
        files.push({
          path: `src/components/${name}.tsx`,
          content: this.extractCodeFromResponse(code),
          language: 'typescript',
          type: 'component'
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to generate component ${name}:`, error);
      }
    }

    return files;
  }

  private async generateServices(prompt: string, architecture: any): Promise<ProjectFile[]> {
    const files: ProjectFile[] = [];

    // API Service
    const apiPrompt = `
CREATE API SERVICE FOR: ${prompt}

Generate a complete API service with:
- HTTP client setup (fetch/axios)
- Request/response interceptors
- Error handling
- Authentication tokens
- Type-safe API methods
- Real-time subscriptions if needed
- Caching mechanisms

Architecture: ${JSON.stringify(architecture)}

Generate ONLY the complete apiService.ts code.
`;

    const apiCode = await geminiService.generateResponse(apiPrompt);
    files.push({
      path: 'src/services/apiService.ts',
      content: this.extractCodeFromResponse(apiCode),
      language: 'typescript',
      type: 'service'
    });

    // Authentication Service
    const authPrompt = `
CREATE AUTHENTICATION SERVICE FOR: ${prompt}

Generate complete auth service with:
- Login/logout functionality
- Token management
- User session handling
- Protected route logic
- Password reset
- Social auth integration
- Type definitions

Generate ONLY the complete authService.ts code.
`;

    const authCode = await geminiService.generateResponse(authPrompt);
    files.push({
      path: 'src/services/authService.ts',
      content: this.extractCodeFromResponse(authCode),
      language: 'typescript',
      type: 'service'
    });

    return files;
  }

  private async generateUtilities(prompt: string, architecture: any): Promise<ProjectFile[]> {
    const files: ProjectFile[] = [];

    // Custom Hooks
    const hooksPrompt = `
CREATE CUSTOM REACT HOOKS FOR: ${prompt}

Generate useful custom hooks:
- Data fetching hooks
- Form handling hooks  
- Local storage hooks
- Debounce/throttle hooks
- Modal/dialog hooks
- Real-time data hooks

Architecture: ${JSON.stringify(architecture)}

Generate ONLY the complete hooks code in a single file.
`;

    const hooksCode = await geminiService.generateResponse(hooksPrompt);
    files.push({
      path: 'src/hooks/index.ts',
      content: this.extractCodeFromResponse(hooksCode),
      language: 'typescript',
      type: 'utility'
    });

    // Utility Functions
    const utilsPrompt = `
CREATE UTILITY FUNCTIONS FOR: ${prompt}

Generate utility functions for:
- Date/time formatting
- Data validation
- String manipulation
- Array/object helpers
- File handling
- Format converters
- Constants and enums

Generate ONLY the complete utils.ts code.
`;

    const utilsCode = await geminiService.generateResponse(utilsPrompt);
    files.push({
      path: 'src/utils/helpers.ts',
      content: this.extractCodeFromResponse(utilsCode),
      language: 'typescript',
      type: 'utility'
    });

    return files;
  }

  private async generateConfiguration(architecture: any): Promise<ProjectFile[]> {
    const files: ProjectFile[] = [];

    // Types definition
    const typesPrompt = `
CREATE TYPESCRIPT TYPES AND INTERFACES FOR APPLICATION

Based on architecture: ${JSON.stringify(architecture)}

Generate comprehensive type definitions:
- User/Auth types
- API response types
- Component prop types
- State management types
- Database entity types
- Form validation types

Generate ONLY the complete types.ts code.
`;

    const typesCode = await geminiService.generateResponse(typesPrompt);
    files.push({
      path: 'src/types/index.ts',
      content: this.extractCodeFromResponse(typesCode),
      language: 'typescript',
      type: 'config'
    });

    return files;
  }

  private getComponentPrompts(prompt: string, architecture: any): Record<string, string> {
    const basePrompt = `
FOR PROJECT: ${prompt}
Architecture: ${JSON.stringify(architecture)}

Generate a COMPLETE, production-ready component with:
- Full TypeScript typing
- Responsive design with Tailwind CSS
- Accessibility features
- Error handling
- Loading states
- Modern React patterns
- Proper imports/exports

Generate ONLY the component code - no explanations.
`;

    return {
      'Header': `${basePrompt}\n\nCreate a Header component with navigation, user menu, search, and responsive mobile menu.`,
      'Sidebar': `${basePrompt}\n\nCreate a Sidebar component with navigation links, user profile, and collapsible mobile version.`,
      'Modal': `${basePrompt}\n\nCreate a reusable Modal component with animations, backdrop, and keyboard handling.`,
      'Form': `${basePrompt}\n\nCreate a Form component with validation, error display, and submission handling.`,
      'DataTable': `${basePrompt}\n\nCreate a DataTable component with sorting, pagination, filtering, and responsive design.`,
      'Card': `${basePrompt}\n\nCreate a Card component with various layouts, hover effects, and content slots.`
    };
  }

  async improveCode(currentCode: string, improvementPrompt: string): Promise<string> {
    const prompt = `
IMPROVE THIS CODE BASED ON REQUEST: "${improvementPrompt}"

CURRENT CODE:
${currentCode}

REQUIREMENTS:
- Maintain existing functionality
- Add requested improvements
- Fix any bugs or issues
- Optimize performance
- Improve code quality
- Add missing features
- Ensure type safety

Generate ONLY the improved code - no explanations.
`;

    return await geminiService.generateResponse(prompt);
  }

  private extractCodeFromResponse(response: string): string {
    // Remove markdown code blocks if present
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    return codeMatch ? codeMatch[1] : response.trim();
  }

  private extractProjectName(prompt: string): string {
    const words = prompt.toLowerCase().split(' ');
    const projectKeywords = words.filter(word => 
      !['create', 'build', 'make', 'generate', 'app', 'application', 'website', 'clone'].includes(word)
    );
    return projectKeywords.slice(0, 2).join(' ') || 'Generated Project';
  }

  getCurrentProject(): CodeProject | null {
    return this.currentProject;
  }

  isCurrentlyGenerating(): boolean {
    return this.isGenerating;
  }
}

export const aiCodeAgent = new AICodeAgent();
