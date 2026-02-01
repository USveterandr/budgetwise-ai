# BudgetWise AI - Project IDX Configuration
# This file configures the development environment for Project IDX

{ pkgs, ... }: {
  # Which nixpkgs channel to use
  channel = "stable-23.11";

  # Use packages
  packages = [
    pkgs.nodejs_20
    pkgs.git
  ];

  # Sets environment variables in the workspace
  env = {
    # Node environment
    NODE_ENV = "development";
  };

  # Enable previews
  idx = {
    # Enable previews for web applications
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "web" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };

    # Extensions for VS Code in Project IDX
    extensions = [
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "bradlc.vscode-tailwindcss"
    ];
  };

  # Workspace lifecycle hooks
  workspace = {
    # Runs when a workspace is first created
    onCreate = {
      install-npm-packages = ''
        npm install
      '';
    };
    
    # Runs when the workspace is (re)started
    onStart = {
      git-config = ''
        git config --global user.name "BudgetWise Developer"
        git config --global user.email "dev@budgetwise.ai"
      '';
    };
  };
}
