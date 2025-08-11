
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
          prompt: `Create a main App.tsx component for an Instagram clone with routing, authentication, and main layout. Requirements: ${requirements}`,
          fileType: 'tsx',
          priority: 1,
          dependencies: []
        },
        {
          id: 'auth-system',
          prompt: `Create a complete authentication system with login, register, and forgot password components for Instagram clone. Include form validation and error handling. Requirements: ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: []
        },
        {
          id: 'post-component',
          prompt: `Create a sophisticated post component for Instagram clone with like, comment, share functionality, image carousel, and user interactions. Requirements: ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: []
        },
        {
          id: 'profile-page',
          prompt: `Create a detailed user profile page for Instagram clone with post grid, follower/following counts, bio editing, and story highlights. Requirements: ${requirements}`,
          fileType: 'tsx',
          priority: 3,
          dependencies: ['auth-system']
        },
        {
          id: 'feed-page',
          prompt: `Create a main feed page for Instagram clone with infinite scroll, story bar, post interactions, and real-time updates. Requirements: ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: ['post-component']
        },
        {
          id: 'api-hooks',
          prompt: `Create custom React hooks for API calls, data fetching, and state management for Instagram clone. Include caching and error handling. Requirements: ${requirements}`,
          fileType: 'ts',
          priority: 1,
          dependencies: []
        }
      );
    } else {
      // Generic project tasks
      baseTasks.push(
        {
          id: 'main-app',
          prompt: `Create a main application component for ${projectType}. Requirements: ${requirements}`,
          fileType: 'tsx',
          priority: 1,
          dependencies: []
        },
        {
          id: 'components',
          prompt: `Create core components for ${projectType}. Requirements: ${requirements}`,
          fileType: 'tsx',
          priority: 2,
          dependencies: ['main-app']
        },
        {
          id: 'utils',
          prompt: `Create utility functions and helpers for ${projectType}. Requirements: ${requirements}`,
          fileType: 'ts',
          priority: 3,
          dependencies: []
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
    
    // Execute medium priority tasks in parallel
    if (mediumPriorityTasks.length > 0) {
      const mediumResults = await Promise.all(
        mediumPriorityTasks.map(task => this.executeTask(task))
      );
      results.push(...mediumResults);
      mediumResults.forEach((result, index) => {
        this.completedTasks.set(mediumPriorityTasks[index].id, result);
      });
    }
    
    // Execute low priority tasks in parallel
    if (lowPriorityTasks.length > 0) {
      const lowResults = await Promise.all(
        lowPriorityTasks.map(task => this.executeTask(task))
      );
      results.push(...lowResults);
      lowResults.forEach((result, index) => {
        this.completedTasks.set(lowPriorityTasks[index].id, result);
      });
    }
    
    this.isGenerating = false;
    return results;
  }

  private async executeTask(task: CodeGenerationTask): Promise<GeneratedCode> {
    try {
      const enhancedPrompt = `
ADVANCED CODE GENERATION REQUEST:
Task: ${task.prompt}
File Type: ${task.fileType}
Requirements:
- Generate complete, production-ready code
- Include proper TypeScript types and interfaces
- Add comprehensive error handling
- Use modern React patterns and hooks
- Include proper styling with Tailwind CSS
- Add comments for complex logic
- Ensure responsive design
- Include proper imports and exports

Generate ONLY the code content without markdown formatting or explanations.
`;

      const response = await geminiService.generateResponse(
        enhancedPrompt,
        "You are an expert full-stack developer. Generate complete, production-ready code files with proper structure, error handling, and best practices."
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
        content: `// Error generating code for ${task.id}: ${error}`,
        language: task.fileType,
        errors: [`Failed to generate code: ${error}`]
      };
    }
  }

  private generateFileName(taskId: string, fileType: string): string {
    const nameMap: { [key: string]: string } = {
      'main-app': `App.${fileType}`,
      'auth-system': `components/Auth/AuthSystem.${fileType}`,
      'post-component': `components/Post/PostComponent.${fileType}`,
      'profile-page': `pages/Profile.${fileType}`,
      'feed-page': `pages/Feed.${fileType}`,
      'api-hooks': `hooks/useApi.${fileType}`,
      'components': `components/CoreComponents.${fileType}`,
      'utils': `utils/helpers.${fileType}`
    };
    
    return nameMap[taskId] || `generated/${taskId}.${fileType}`;
  }

  private async detectAnomalies(code: string): Promise<string[]> {
    const errors: string[] = [];
    
    // Basic syntax checks
    if (code.includes('undefined') && !code.includes('typeof') && !code.includes('!==')) {
      errors.push('Potential undefined variable usage detected');
    }
    
    if (code.includes('any') && code.includes('TypeScript')) {
      errors.push('TypeScript any type usage - consider proper typing');
    }
    
    if (!code.includes('export') && (code.includes('function') || code.includes('const'))) {
      errors.push('Missing export statement - component may not be importable');
    }
    
    if (code.includes('className') && !code.includes('tailwind') && !code.includes('className="')) {
      errors.push('Possible styling issues - check className usage');
    }
    
    // Advanced anomaly detection using AI
    try {
      const anomalyCheckPrompt = `
Analyze this code for potential bugs, issues, or improvements:
${code.substring(0, 2000)}...

Return ONLY a JSON array of issues found, or empty array if no issues:
["issue1", "issue2"]
`;
      
      const anomalyResponse = await geminiService.generateResponse(
        anomalyCheckPrompt,
        "You are a code quality analyzer. Identify potential bugs, syntax errors, and code quality issues."
      );
      
      try {
        const aiErrors = JSON.parse(anomalyResponse);
        if (Array.isArray(aiErrors)) {
          errors.push(...aiErrors);
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
}

export const advancedCodeGenerator = new AdvancedCodeGenerator();
