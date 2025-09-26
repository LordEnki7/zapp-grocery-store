# ZAPP Code Safety Policy

## Backup Procedures

### ZIP Archive Requirements

1. **Milestone Backups**: Create ZIP archives at the following key points:
   - Initial project setup completion
   - After implementing each major feature
   - Before merging any significant pull requests
   - Prior to any dependency upgrades
   - Before deployment to production

2. **ZIP Naming Convention**: Use the format `zapp-{milestone}-{YYYY-MM-DD}.zip`

3. **ZIP Storage Location**: Store archives in:
   - Primary: Cloud storage (Google Drive/Dropbox)
   - Secondary: Local backup drive
   - Tertiary: Version-controlled releases repository

4. **Archive Script**: Use the included backup script (`scripts/create-backup.js`)

## Modular Architecture Guidelines

### Code Structure Protection

1. **Core Module Definition**:
   - `/src/context` - State management
   - `/src/services` - External service connections
   - `/src/utils` - Shared utilities
   - `/src/hooks` - Shared custom hooks

2. **Core Protection Rules**:
   - Core modules can only be modified after team lead approval
   - All core module changes require:
     - Documentation updates
     - Complete test coverage
     - Architecture review

3. **Feature Development Rules**:
   - New features must be built as isolated modules
   - Use feature flags for gradual rollout
   - Clear interfaces between new code and core code
   - No direct modification of core modules

4. **Dependency Management**:
   - Lock package versions in package.json
   - Document all dependency updates
   - Test thoroughly before upgrading any dependency

## Version Control Best Practices

1. **Branch Strategy**:
   - `main` - Production code
   - `develop` - Integration branch
   - `feature/*` - For new features
   - `bugfix/*` - For bug fixes
   - `release/*` - For release preparation

2. **Pull Request Requirements**:
   - Code review by at least one team member
   - All tests passing
   - No linting errors
   - Documentation updated

3. **Commit Standards**:
   - Use conventional commit messages
   - Reference issue numbers
   - Keep commits focused on single changes

## Implementation Plan

1. **Immediate Actions**:
   - Create backup script
   - Define core modules in documentation
   - Set up branch protection rules

2. **Process Introduction**:
   - Team training on new procedures
   - Update CI/CD pipeline to enforce policies
   - Regular policy compliance audits

3. **Monitoring**:
   - Quarterly review of policy effectiveness
   - Adjust rules based on project evolution 