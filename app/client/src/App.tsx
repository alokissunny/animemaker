import { useAppState } from './state/useAppState';
import { TopNav } from './components/TopNav';
import { Landing } from './components/screens/Landing';
import { Login } from './components/screens/Login';
import { Dashboard } from './components/screens/Dashboard';
import { ProjectDetail } from './components/screens/ProjectDetail';
import { Characters } from './components/screens/Characters';
import { EpisodeSetup } from './components/screens/EpisodeSetup';
import { Story } from './components/screens/Story';
import { Scenes } from './components/screens/Scenes';
import { Videos } from './components/screens/Videos';
import { Final } from './components/screens/Final';

function App() {
  const app = useAppState();
  const selectedProject = app.projects.find((p) => p.id === app.selectedProjectId) || app.projects[0];

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#0A0A12', fontFamily: "'Manrope',sans-serif", color: '#F5F4FA', position: 'relative', overflowX: 'hidden' }}>
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.20),transparent 70%)', filter: 'blur(20px)', animation: 'floatBlob 14s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.16),transparent 70%)', filter: 'blur(20px)', animation: 'floatBlob 18s ease-in-out infinite reverse', pointerEvents: 'none', zIndex: 0 }} />

      <TopNav screen={app.screen} onLogoClick={app.goDashboard} onStepClick={app.jumpToStep} saveStatus={app.saveStatus} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {app.screen === 'landing' && <Landing onGetStarted={app.goLogin} />}

        {app.screen === 'login' && <Login authTab={app.authTab} setAuthTab={app.setAuthTab} onSubmit={app.goDashboard} />}

        {app.screen === 'dashboard' && (
          <Dashboard
            projects={app.projects}
            onStartNew={app.startNewEpisode}
            onOpenProject={app.openProject}
            savedProject={app.savedProject}
            onResumeSaved={app.resumeSavedProject}
          />
        )}

        {app.screen === 'projectDetail' && (
          <ProjectDetail project={selectedProject} onBack={app.goDashboard} onResume={app.resumeProject} />
        )}

        {app.screen === 'characters' && (
          <Characters
            charTab={app.charTab}
            setCharTab={app.setCharTab}
            draft={app.draft}
            setDraftField={app.setDraftField}
            setDraftRole={app.setDraftRole}
            charGenStatus={app.charGenStatus}
            charGenError={app.charGenError}
            charGenResult={app.charGenResult}
            generateCharacter={app.generateCharacter}
            saveCharacter={app.saveCharacter}
            characters={app.characters}
            continueToEpisodeSetup={app.continueToEpisodeSetup}
          />
        )}

        {app.screen === 'episodeSetup' && (
          <EpisodeSetup episodeConfig={app.episodeConfig} setEpisodeField={app.setEpisodeField} generateStory={app.generateStoryAction} />
        )}

        {app.screen === 'story' && (
          <Story
            episodeConfig={app.episodeConfig}
            story={app.story}
            storyGenStatus={app.storyGenStatus}
            storyGenError={app.storyGenError}
            isEditingStory={app.isEditingStory}
            toggleEditStory={app.toggleEditStory}
            setStoryFull={app.setStoryFull}
            approveStory={app.approveStory}
            regenerateStory={app.regenerateStory}
          />
        )}

        {app.screen === 'scenes' && (
          <Scenes
            scenes={app.scenes}
            scenesGenStatus={app.scenesGenStatus}
            scenesGenError={app.scenesGenError}
            regeneratingSceneIds={app.regeneratingSceneIds}
            approveScene={app.approveScene}
            regenerateScene={app.regenerateScene}
            goToVideos={app.goToVideos}
          />
        )}

        {app.screen === 'videos' && (
          <Videos
            scenes={app.scenes}
            videos={app.videos}
            approveVideo={app.approveVideo}
            regenerateVideo={app.regenerateVideo}
            editingMotionPromptId={app.editingMotionPromptId}
            setEditingMotionPromptId={app.setEditingMotionPromptId}
            updateSceneMotionPrompt={app.updateSceneMotionPrompt}
            previewSceneId={app.previewSceneId}
            setPreviewSceneId={app.setPreviewSceneId}
            goToFinal={app.goToFinal}
          />
        )}

        {app.screen === 'final' && (
          <Final
            scenes={app.scenes}
            videos={app.videos}
            story={app.story}
            finalConfig={app.finalConfig}
            toggleCaptions={app.toggleCaptions}
            setMusic={app.setMusic}
            setExportFormat={app.setExportFormat}
            activeSceneIndex={app.activeSceneIndex}
            setActiveSceneIndex={app.setActiveSceneIndex}
            exportTransition={app.exportTransition}
            setExportTransition={app.setExportTransition}
            exportStatus={app.exportStatus}
            exportError={app.exportError}
            exportId={app.exportId}
            startExport={app.startExport}
          />
        )}
      </div>
    </div>
  );
}

export default App;
