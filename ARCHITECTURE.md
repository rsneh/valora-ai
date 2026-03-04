# Valora.ai - System Architecture & Design Decisions

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Choices](#technology-choices)
4. [AI System Architecture](#ai-system-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Data Flow](#data-flow)
8. [Security Architecture](#security-architecture)
9. [Performance Optimizations](#performance-optimizations)
10. [Scalability Considerations](#scalability-considerations)

## System Overview

Valora.ai is built as a modern, cloud-native application following microservices principles and event-driven architecture. The system is designed to handle high concurrency, provide real-time AI interactions, and scale horizontally.

```
┌─────────────────────────────────────────────────────────────┐
│                         Load Balancer                        │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
         ┌────────▼─────────┐   ┌────────▼─────────┐
         │   Next.js SSR    │   │  FastAPI Backend  │
         │   (Frontend)     │   │   (API Gateway)   │
         └────────┬─────────┘   └────────┬─────────┘
                  │                       │
         ┌────────▼─────────────────────────▼─────────┐
         │           Service Layer                     │
         │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
         │  │ Product  │  │   Chat   │  │    AI    │ │
         │  │ Service  │  │ Service  │  │ Service  │ │
         │  └──────────┘  └──────────┘  └──────────┘ │
         └──────────────────┬──────────────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │         Data Layer                  │
         │  ┌──────────┐  ┌──────────┐       │
         │  │PostgreSQL│  │   GCS    │       │
         │  └──────────┘  └──────────┘       │
         └─────────────────────────────────────┘
```

## Architecture Principles

### 1. **Domain-Driven Design (DDD)**
- Clear bounded contexts: Products, Chat, AI, Users
- Rich domain models with business logic encapsulation
- Repository pattern for data access abstraction

### 2. **SOLID Principles**
- **Single Responsibility**: Each service handles one domain
- **Open/Closed**: Extensible through interfaces, not modification
- **Liskov Substitution**: AI providers are interchangeable
- **Interface Segregation**: Minimal, focused interfaces
- **Dependency Inversion**: Services depend on abstractions

### 3. **12-Factor App Methodology**
- Codebase tracked in Git
- Dependencies explicitly declared
- Config stored in environment
- Backing services as attached resources
- Build, release, run strictly separated

## Technology Choices

### Backend: FastAPI + Python 3.11
**Why FastAPI?**
- **Async Performance**: Native async/await for handling concurrent AI operations
- **Type Safety**: Pydantic models provide runtime validation
- **Auto Documentation**: OpenAPI/Swagger built-in
- **Modern Python**: Leverages latest Python features

**Alternative Considered**: Django
- Rejected due to synchronous nature and overhead for our microservices approach

### Frontend: Next.js 15 + TypeScript
**Why Next.js?**
- **SSR/SSG**: Improved SEO and initial load performance
- **App Router**: Modern routing with layouts and loading states
- **React Server Components**: Reduced client bundle size
- **Built-in Optimizations**: Image, font, and script optimization

**Alternative Considered**: Create React App
- Rejected due to lack of SSR and additional configuration needs

### Database: PostgreSQL
**Why PostgreSQL?**
- **ACID Compliance**: Critical for marketplace transactions
- **JSON Support**: Flexible schema for AI-generated content
- **Full-Text Search**: Built-in search capabilities
- **Proven Scalability**: Handles large datasets efficiently

**Alternative Considered**: MongoDB
- Rejected due to need for strong consistency and relationships

### AI Integration: Multi-Model Approach
**Why Multiple AI Providers?**
- **Redundancy**: Fallback options if one service fails
- **Specialization**: Different models for different tasks
- **Cost Optimization**: Use cheaper models where possible
- **Future-Proofing**: Easy to add new providers

## AI System Architecture

### Multi-Agent System Design

```python
# Simplified AI Service Architecture
class AIServiceFactory:
    """Factory pattern for AI provider instantiation"""
    
    @staticmethod
    def create_provider(provider_type: AIProvider) -> BaseAIService:
        providers = {
            AIProvider.OPENAI: OpenAIService,
            AIProvider.GEMINI: GeminiService,
            AIProvider.CLAUDE: ClaudeService,
        }
        return providers[provider_type]()

class AIOrchestrator:
    """Orchestrates multiple AI services for complex tasks"""
    
    async def analyze_product(self, image: bytes) -> ProductAnalysis:
        # Use Gemini Vision for image analysis
        vision_result = await self.gemini.analyze_image(image)
        
        # Use GPT-4 for description generation
        description = await self.openai.generate_description(vision_result)
        
        # Use Claude for category prediction
        category = await self.claude.predict_category(description)
        
        return ProductAnalysis(
            vision=vision_result,
            description=description,
            category=category
        )
```

### LangChain Integration
- **Prompt Management**: Centralized prompt templates
- **Chain Composition**: Complex multi-step AI workflows
- **Memory Management**: Conversation history handling
- **Observability**: LangSmith integration for monitoring

## Backend Architecture

### Service Layer Pattern

```python
# Domain Services Structure
app/
├── services/
│   ├── product_service.py      # Product domain logic
│   ├── chat_service.py          # Chat & messaging logic
│   ├── ai_negotiation_service.py # AI agent logic
│   ├── gcp_services.py          # Cloud service integration
│   └── location_service.py      # Geolocation services
├── models/
│   ├── product.py               # SQLAlchemy models
│   ├── user.py
│   └── chat.py
└── api/
    └── v1/
        └── endpoints/           # API route handlers
```

### Dependency Injection

```python
# FastAPI Dependency Injection Example
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency injection for authentication"""
    payload = verify_token(token)
    user = db.query(User).filter(User.id == payload.sub).first()
    if not user:
        raise HTTPException(status_code=401)
    return user

@router.post("/products")
async def create_product(
    product: ProductCreate,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """Endpoint with injected dependencies"""
    return await create_product_with_ai(product, current_user, ai_service)
```

### Async Architecture

```python
# Async Service Pattern
class ProductService:
    async def process_product_image(self, image: UploadFile) -> Product:
        # Parallel async operations
        async with asyncio.TaskGroup() as tg:
            upload_task = tg.create_task(self.upload_to_gcs(image))
            optimize_task = tg.create_task(self.optimize_image(image))
            analyze_task = tg.create_task(self.ai_service.analyze(image))
        
        # All tasks complete here
        return await self.create_product(
            image_url=upload_task.result(),
            thumbnail=optimize_task.result(),
            ai_analysis=analyze_task.result()
        )
```

## Frontend Architecture

### Component Structure

```typescript
// Atomic Design Pattern
components/
├── atoms/           // Basic building blocks
│   ├── Button.tsx
│   └── Input.tsx
├── molecules/       // Combinations of atoms
│   ├── SearchBar.tsx
│   └── ProductCard.tsx
├── organisms/       // Complex components
│   ├── ProductGrid.tsx
│   └── ChatInterface.tsx
└── templates/       // Page layouts
    ├── MarketplaceLayout.tsx
    └── DashboardLayout.tsx
```

### State Management Strategy

```typescript
// Context + Hooks Pattern
const AuthContext = React.createContext<AuthContextType>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be within AuthProvider');
    return context;
};

// Custom hooks for data fetching
export const useProducts = (filters: ProductFilters) => {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: () => fetchProducts(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
```

## Data Flow

### Real-time Chat Architecture

```
User A (Buyer)          Server              AI Agent         User B (Seller)
     │                    │                    │                  │
     ├───Message──────────►                    │                  │
     │                    ├──Process───────────►                  │
     │                    │                    ├──Generate        │
     │                    ◄────Response────────┤                  │
     │                    ├──────────────────────────Notify──────►│
     ◄───Update───────────┤                    │                  │
     │                    │                    │                  │
```

### Image Processing Pipeline

```python
# Image Processing Flow
async def process_product_image(image: UploadFile) -> ProcessedImage:
    # 1. Validate image
    validate_image_format(image)
    
    # 2. Generate thumbnails (parallel)
    thumbnails = await generate_thumbnails(image, sizes=[150, 300, 600])
    
    # 3. Optimize for web (WebP conversion)
    optimized = await convert_to_webp(image, quality=85)
    
    # 4. Upload to GCS (parallel)
    urls = await asyncio.gather(
        upload_to_gcs(optimized, 'products/full/'),
        *[upload_to_gcs(thumb, f'products/thumb_{size}/') 
          for size, thumb in thumbnails.items()]
    )
    
    # 5. AI Analysis
    ai_results = await ai_service.analyze_image(optimized)
    
    return ProcessedImage(urls=urls, analysis=ai_results)
```

## Security Architecture

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────►│ Firebase │────►│   API    │────►│   DB     │
│          │◄────│   Auth   │◄────│ Gateway  │◄────│          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                │
     │   1. Login     │                 │                │
     ├───────────────►│                 │                │
     │                │  2. Verify      │                │
     │◄───────────────┤                 │                │
     │   JWT Token    │                 │                │
     │                │                 │                │
     │   3. Request + Token             │                │
     ├─────────────────────────────────►│                │
     │                │                 │  4. Validate   │
     │                │                 ├───────────────►│
     │                │                 │  5. Data       │
     │◄─────────────────────────────────┤◄───────────────┤
     │   6. Response  │                 │                │
```

### Security Measures

1. **Input Validation**: Pydantic models validate all inputs
2. **SQL Injection Prevention**: Parameterized queries via SQLAlchemy
3. **XSS Protection**: Content sanitization on frontend
4. **CORS Configuration**: Strict origin whitelisting
5. **Rate Limiting**: Ready for implementation with Redis
6. **Secrets Management**: Environment variables, no hardcoding

## Performance Optimizations

### Database Optimizations

```python
# N+1 Query Prevention
products = db.query(Product)\
    .options(
        selectinload(Product.images),
        selectinload(Product.owner),
        selectinload(Product.category)
    )\
    .filter(Product.status == 'active')\
    .all()

# Indexed Columns
class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), index=True)
    created_at = Column(DateTime, index=True)
    status = Column(String, index=True)
    
    __table_args__ = (
        Index('ix_product_search', 'title', 'description'),
        Index('ix_product_location', 'latitude', 'longitude'),
    )
```

### Frontend Optimizations

```typescript
// Dynamic imports for code splitting
const ChatInterface = dynamic(() => import('@/components/ChatInterface'), {
    loading: () => <ChatSkeleton />,
    ssr: false
});

// Image optimization
<Image
    src={product.image}
    alt={product.title}
    width={300}
    height={300}
    loading="lazy"
    placeholder="blur"
    blurDataURL={product.thumbnail}
/>

// Memoization for expensive computations
const expensiveFilter = useMemo(() => {
    return products.filter(p => 
        p.price >= minPrice && 
        p.price <= maxPrice &&
        p.category === selectedCategory
    );
}, [products, minPrice, maxPrice, selectedCategory]);
```

## Scalability Considerations

### Horizontal Scaling Strategy

1. **Stateless Services**: All services designed to be stateless
2. **Database Connection Pooling**: Configured for high concurrency
3. **CDN Integration**: Static assets served via CDN
4. **Caching Layer**: Redis-ready architecture
5. **Message Queue Ready**: Can add RabbitMQ/Kafka for async processing

### Future Scaling Path

```yaml
# Kubernetes Deployment (Future)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: valora-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: valora-backend
  template:
    spec:
      containers:
      - name: backend
        image: valora/backend:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Monitoring & Observability

1. **Application Metrics**: Response times, error rates, throughput
2. **AI Metrics**: Model latency, token usage, accuracy
3. **Business Metrics**: User engagement, conversion rates
4. **Infrastructure Metrics**: CPU, memory, disk, network

## Conclusion

This architecture is designed to be:
- **Scalable**: Can handle growth from hundreds to millions of users
- **Maintainable**: Clear separation of concerns and documentation
- **Resilient**: Fault tolerance and graceful degradation
- **Performant**: Optimized for speed at every layer
- **Secure**: Defense in depth approach
- **Modern**: Uses latest technologies and best practices

The system demonstrates proficiency in:
- System design and architecture
- Cloud-native development
- AI/ML integration
- Full-stack development
- DevOps practices
- Security implementation