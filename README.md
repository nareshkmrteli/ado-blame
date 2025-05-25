# ADO Blame

A Visual Studio Code extension that shows git blame information in the status bar with Azure DevOps work item integration.

## Features

- Shows commit blame information for the currently selected line in the status bar
- Integrates with Azure DevOps to show work item details
- Supports both standard blame tracking and Azure DevOps work item integration
- Easy configuration through VS Code settings

## Requirements

- Git installed and available in PATH
- Azure DevOps Personal Access Token (PAT) for work item integration
- Visual Studio Code version 1.0.0 or higher

## Extension Settings

This extension contributes the following settings:

* `adoblame.azureDevOps.pat`: Azure DevOps Personal Access Token (PAT) for accessing work item information
* `adoblame.azureDevOps.organizationUrl`: Azure DevOps organization URL (e.g., https://dev.azure.com/your-org)

## Usage

1. Open a file in a Git repository
2. The blame information for the current line will be shown in the status bar
3. If the commit message contains an Azure DevOps work item reference (e.g., #123 or AB#123), the work item details will be shown

## Known Issues

Please report any issues on our [GitHub repository](https://github.com/nareshkmrteli/ado-blame/issues).

## Release Notes

### 1.0.0

Initial release of ADO Blame:
- Commit blame information in status bar
- Azure DevOps work item integration
- Configuration options for Azure DevOps connection

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
