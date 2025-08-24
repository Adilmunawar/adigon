
import { geminiService } from './geminiService';

export interface CodeGenerationTask {
  id: string;
  prompt: string;
  fileType: string;
  priority: number;
  dependencies: string[];
}

export interface GeneratedCode {
  fileName: string;
  content: string;
  language: string;
  errors: string[];
}

export class AdvancedCodeGenerator {
  private taskQueue: CodeGenerationTask[] = [];
  private completedTasks: Map<string, GeneratedCode> = new Map();
  private isGenerating = false;

  async generateLargeCodebase(projectType: string, requirements: string): Promise<GeneratedCode[]> {
    const tasks = this.createTasksForProject(projectType, requirements);
    return await this.executeTasksInParallel(tasks);
  }

  private createTasksForProject(projectType: string, requirements: string): CodeGenerationTask[] {
    const baseTasks: CodeGenerationTask[] = [];
    
    if (projectType.toLowerCase().includes('instagram') || projectType.toLowerCase().includes('social')) {
      baseTasks.push(
        {
          id: 'main-app',
          prompt: `Create a complete Instagram clone main App.tsx with routing, authentication, theme provider, and layout structure. Include advanced features like dark mode, responsive design, and modern UI patterns. ${requirements}`,
          fileType: 'tsx',
          priority: 1,
          dependencies: []
        },
        {
          id: 'auth-system',
          prompt: `Create a comprehensive authentication system for Instagram clone with login, register, forgot password, email verification, and protected routes. Include form validation, error handling, and modern UI components. ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: []
        },
        {
          id: 'post-component',
          prompt: `Create an advanced post component for Instagram clone with image carousel, like/unlike, comments, share functionality, save posts, user interactions, and real-time updates. Include animations and modern UI. ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: []
        },
        {
          id: 'profile-page',
          prompt: `Create a comprehensive user profile page for Instagram clone with post grid, stories, followers/following, bio editing, profile picture upload, and settings. Include advanced features and responsive design. ${requirements}`,
          fileType: 'tsx',
          priority: 3,
          dependencies: ['auth-system']
        },
        {
          id: 'feed-page',
          prompt: `Create an advanced feed page for Instagram clone with infinite scroll, story highlights, post interactions, search functionality, and real-time notifications. Include modern UI patterns and performance optimizations. ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: ['post-component']
        },
        {
          id: 'api-hooks',
          prompt: `Create comprehensive custom React hooks and API utilities for Instagram clone including data fetching, caching, state management, real-time subscriptions, and error handling. Include TypeScript types and interfaces. ${requirements}`,
          fileType: 'ts',
          priority: 1,
          dependencies: []
        },
        {
          id: 'components-library',
          prompt: `Create a comprehensive UI components library for Instagram clone including buttons, modals, forms, avatars, loading states, and reusable components with TypeScript and Tailwind CSS. ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: []
        }
      );
    } else if (projectType.toLowerCase().includes('e-commerce') || projectType.toLowerCase().includes('shop')) {
      baseTasks.push(
        {
          id: 'main-app',
          prompt: `Create a complete e-commerce platform main App.tsx with routing, cart management, authentication, and responsive layout. Include modern design patterns and performance optimizations. ${requirements}`,
          fileType: 'tsx',
          priority: 1,
          dependencies: []
        },
        {
          id: 'product-catalog',
          prompt: `Create an advanced product catalog system with filtering, sorting, search, categories, and product detail views. Include pagination, wishlist, and comparison features. ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: []
        },
        {
          id: 'shopping-cart',
          prompt: `Create a comprehensive shopping cart system with add/remove items, quantity management, discount codes, shipping calculations, and checkout process. Include persistence and animations. ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: []
        },
        {
          id: 'payment-system',
          prompt: `Create a secure payment processing system with multiple payment methods, order confirmation, invoice generation, and payment status tracking. Include error handling and validation. ${requirements}`,
          fileType: 'tsx',
          priority: 3,
          dependencies: ['shopping-cart']
        },
        {
          id: 'user-dashboard',
          prompt: `Create a comprehensive user dashboard with order history, profile management, addresses, payment methods, and account settings. Include responsive design and data visualization. ${requirements}`,
          fileType: 'tsx',
          priority: 3,
          dependencies: ['main-app']
        }
      );
    } else if (projectType.toLowerCase().includes('dashboard') || projectType.toLowerCase().includes('admin')) {
      baseTasks.push(
        {
          id: 'main-dashboard',
          prompt: `Create a professional admin dashboard with sidebar navigation, responsive layout, data widgets, and modern UI components. Include dark mode and customizable themes. ${requirements}`,
          fileType: 'tsx',
          priority: 1,
          dependencies: []
        },
        {
          id: 'analytics-components',
          prompt: `Create advanced analytics components with interactive charts, data visualizations, KPI cards, and reporting features. Include real-time data updates and export functionality. ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: []
        },
        {
          id: 'data-tables',
          prompt: `Create sophisticated data table components with sorting, filtering, pagination, search, bulk actions, and export features. Include responsive design and performance optimizations. ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: []
        },
        {
          id: 'form-builder',
          prompt: `Create a dynamic form builder with validation, conditional fields, file uploads, and form submissions. Include drag-and-drop interface and custom field types. ${requirements}`,
          fileType: 'tsx',
          priority: 3,
          dependencies: ['main-dashboard']
        }
      );
    } else {
      // Enhanced generic project tasks
      baseTasks.push(
        {
          id: 'main-app',
          prompt: `Create a complete main application component for ${projectType} with modern architecture, routing, state management, and responsive design. Include comprehensive error boundaries and loading states. ${requirements}`,
          fileType: 'tsx',
          priority: 1,
          dependencies: []
        },
        {
          id: 'core-components',
          prompt: `Create advanced core components for ${projectType} with modern React patterns, TypeScript interfaces, accessibility features, and comprehensive functionality. ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: ['main-app']
        },
        {
          id: 'utilities-hooks',
          prompt: `Create comprehensive utility functions and custom hooks for ${projectType} including data fetching, state management, form handling, and performance optimizations. ${requirements}`,
          fileType: 'ts',
          priority: 2,
          dependencies: []
        },
        {
          id: 'ui-components',
          prompt: `Create a complete UI component library for ${projectType} with reusable components, consistent styling, animations, and responsive design patterns. ${requirements}`,
          fileType: 'tsx',
          priority: 3,
          dependencies: ['core-components']
        }
      );
    }
    
    return baseTasks;
  }

  private async executeTasksInParallel(tasks: CodeGenerationTask[]): Promise<GeneratedCode[]> {
    this.isGenerating = true;
    const results: GeneratedCode[] = [];
    
    // Sort tasks by priority
    const sortedTasks = tasks.sort((a, b) => a.priority - b.priority);
    
    // Execute high priority tasks first, then parallel execution for others
    const highPriorityTasks = sortedTasks.filter(task => task.priority === 1);
    const mediumPriorityTasks = sortedTasks.filter(task => task.priority === 2);
    const lowPriorityTasks = sortedTasks.filter(task => task.priority === 3);
    
    // Execute high priority tasks sequentially
    for (const task of highPriorityTasks) {
      const result = await this.executeTask(task);
      results.push(result);
      this.completedTasks.set(task.id, result);
    }
    
    // Execute medium priority tasks in parallel (limited concurrency)
    if (mediumPriorityTasks.length > 0) {
      const batchSize = 2; // Limit concurrent requests
      for (let i = 0; i < mediumPriorityTasks.length; i += batchSize) {
        const batch = mediumPriorityTasks.slice(i, i + batchSize);
        const mediumResults = await Promise.all(
          batch.map(task => this.executeTask(task))
        );
        results.push(...mediumResults);
        mediumResults.forEach((result, index) => {
          this.completedTasks.set(batch[index].id, result);
        });
      }
    }
    
    // Execute low priority tasks in parallel
    if (lowPriorityTasks.length > 0) {
      const batchSize = 2;
      for (let i = 0; i < lowPriorityTasks.length; i += batchSize) {
        const batch = lowPriorityTasks.slice(i, i + batchSize);
        const lowResults = await Promise.all(
          batch.map(task => this.executeTask(task))
        );
        results.push(...lowResults);
        lowResults.forEach((result, index) => {
          this.completedTasks.set(batch[index].id, result);
        });
      }
    }
    
    this.isGenerating = false;
    return results;
  }

  private async executeTask(task: CodeGenerationTask): Promise<GeneratedCode> {
    try {
      const enhancedPrompt = `
ADVANCED ENTERPRISE CODE GENERATION:

Task: ${task.prompt}
File Type: ${task.fileType}

REQUIREMENTS:
- Generate COMPLETE, production-ready code with full implementations
- Include comprehensive TypeScript types and interfaces
- Add robust error handling and edge cases
- Use modern React patterns (hooks, functional components, context)
- Include proper styling with Tailwind CSS and responsive design
- Add detailed JSDoc comments for complex functions
- Ensure accessibility (ARIA labels, keyboard navigation)
- Include loading states, error boundaries, and user feedback
- Implement proper form validation and data sanitization
- Add comprehensive testing considerations
- Use modern ES6+ features and best practices
- Include proper imports and exports
- Ensure code is modular and maintainable

CRITICAL: Generate ONLY complete, functional code. No placeholder comments, no TODO items, no incomplete implementations.

Format your response as complete ${task.fileType} code that can be directly used in production.
`;

      const response = await geminiService.generateResponse(
        enhancedPrompt,
        "You are a senior full-stack developer and architect. Generate complete, enterprise-grade, production-ready code with comprehensive functionality and modern best practices. Never use placeholder code or incomplete implementations."
      );

      const fileName = this.generateFileName(task.id, task.fileType);
      const errors = await this.detectAnomalies(response);
      
      return {
        fileName,
        content: response,
        language: task.fileType === 'tsx' ? 'typescript' : task.fileType,
        errors
      };
    } catch (error) {
      console.error(`Error executing task ${task.id}:`, error);
      return {
        fileName: this.generateFileName(task.id, task.fileType),
        content: `// Error generating code for ${task.id}
// ${error}
// Please try regenerating this file`,
        language: task.fileType,
        errors: [`Failed to generate code: ${error}`]
      };
    }
  }

  private generateFileName(taskId: string, fileType: string): string {
    const nameMap: { [key: string]: string } = {
      'main-app': `src/App.${fileType}`,
      'main-dashboard': `src/components/Dashboard.${fileType}`,
      'auth-system': `src/components/Auth/AuthSystem.${fileType}`,
      'post-component': `src/components/Post/PostComponent.${fileType}`,
      'profile-page': `src/pages/Profile.${fileType}`,
      'feed-page': `src/pages/Feed.${fileType}`,
      'product-catalog': `src/components/Product/ProductCatalog.${fileType}`,
      'shopping-cart': `src/components/Cart/ShoppingCart.${fileType}`,
      'payment-system': `src/components/Payment/PaymentSystem.${fileType}`,
      'user-dashboard': `src/pages/UserDashboard.${fileType}`,
      'analytics-components': `src/components/Analytics/AnalyticsComponents.${fileType}`,
      'data-tables': `src/components/DataTable/DataTable.${fileType}`,
      'form-builder': `src/components/Forms/FormBuilder.${fileType}`,
      'api-hooks': `src/hooks/useApi.${fileType}`,
      'utilities-hooks': `src/utils/hooks.${fileType}`,
      'core-components': `src/components/Core/CoreComponents.${fileType}`,
      'ui-components': `src/components/UI/UIComponents.${fileType}`,
      'components-library': `src/components/Library/ComponentLibrary.${fileType}`
    };
    
    return nameMap[taskId] || `src/generated/${taskId}.${fileType}`;
  }

  private async detectAnomalies(code: string): Promise<string[]> {
    const errors: string[] = [];
    
    // Enhanced syntax and pattern checks
    const checks = [
      {
        pattern: /console\.log\(/g,
        message: 'Development console.log statements detected - consider removing for production'
      },
      {
        pattern: /TODO|FIXME|HACK/gi,
        message: 'TODO/FIXME comments found - implementation may be incomplete'
      },
      {
        pattern: /any\s*[;,)]/g,
        message: 'TypeScript "any" type usage - consider proper typing'
      },
      {
        pattern: /\.innerHTML\s*=/g,
        message: 'Potential XSS vulnerability with innerHTML usage'
      },
      {
        pattern: /eval\(/g,
        message: 'Dangerous eval() usage detected'
      },
      {
        pattern: /document\.write/g,
        message: 'document.write usage - consider modern DOM manipulation'
      },
      {
        pattern: /var\s+/g,
        message: 'Use of "var" keyword - prefer "let" or "const"'
      }
    ];

    checks.forEach(check => {
      if (check.pattern.test(code)) {
        errors.push(check.message);
      }
    });
    
    // Check for missing imports
    if (code.includes('React') && !code.includes("import React")) {
      errors.push('Missing React import statement');
    }
    
    if (code.includes('useState') && !code.includes('useState')) {
      errors.push('useState used but not imported from React');
    }
    
    // Check for missing exports
    if ((code.includes('function') || code.includes('const')) && !code.includes('export')) {
      errors.push('Component or function may be missing export statement');
    }

    // Advanced AI-based anomaly detection
    try {
      const anomalyCheckPrompt = `
Analyze this code for potential bugs, security issues, performance problems, and code quality issues:

${code.substring(0, 3000)}...

Return a JSON array of specific issues found (max 5 most critical):
["issue1", "issue2", "issue3"]
`;
      
      const anomalyResponse = await geminiService.generateResponse(
        anomalyCheckPrompt,
        "You are an expert code security and quality analyzer. Return only a JSON array of the most critical issues found."
      );
      
      try {
        const aiErrors = JSON.parse(anomalyResponse);
        if (Array.isArray(aiErrors)) {
          errors.push(...aiErrors.slice(0, 5)); // Limit to 5 AI-detected errors
        }
      } catch {
        // If AI response isn't valid JSON, skip AI-detected errors
      }
    } catch (error) {
      console.log('AI anomaly detection failed:', error);
    }
    
    return errors;
  }

  getGenerationStatus(): { isGenerating: boolean; completedTasks: number } {
    return {
      isGenerating: this.isGenerating,
      completedTasks: this.completedTasks.size
    };
  }

  clearCache(): void {
    this.completedTasks.clear();
    this.taskQueue = [];
  }
}

export const advancedCodeGenerator = new AdvancedCodeGenerator();
