# tictactoe Ollama

## About

tictactoe Ollama is an open source chat UI for Ollama.




## Running Locally

### 1. Clone Repo

```bash
git clone https://github.com/HaithamMahajna/tictactoe-ollama.git
```

### 2. Move to folder

```bash
cd tictactoe-ollama
```

### 3. Install Dependencies

```bash
npm ci
```

### 4. Run Ollama server

Either via the cli:

```bash
ollama serve
```

or via the [desktop client](https://ollama.ai/download)

### 5. Run App

```bash
npm run dev
```

### 6. Use It

You should be able to start chatting.

## Configuration

When deploying the application, the following environment variables can be set:

| Environment Variable              | Default value                  | Description                                                                                                                               |
| --------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| DEFAULT_MODEL                     | `gemma3:1b`                | The default model to use on new conversations                                                                                             |
                                                                          |


