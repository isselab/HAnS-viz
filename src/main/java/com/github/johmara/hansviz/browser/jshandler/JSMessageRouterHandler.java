package com.github.johmara.hansviz.browser.jshandler;

import JSONHandler.JSONHandler;

import com.intellij.openapi.progress.ProgressIndicator;
import com.intellij.openapi.progress.ProgressManager;
import com.intellij.openapi.progress.Task;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.project.ProjectManager;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;
import org.jetbrains.annotations.NotNull;
import se.isselab.HAnS.featureExtension.FeatureService;

import java.util.concurrent.atomic.AtomicReference;


public class JSMessageRouterHandler extends CefMessageRouterHandlerAdapter {

    private final Project project = ProjectManager.getInstance().getOpenProjects()[0];
    //private final FeatureService service = ProjectManager.getInstance().getOpenProjects()[0].getService(FeatureService.class);

    /**
     * Request on javascript side (that are called with window.java or window.javacancel are handeled here
     * @param browser CefBrowser
     * @param frame CefFrame
     * @param queryId long
     * @param request String: This request will be handeled
     * @param persistent boolean
     * @param callback CefQueryCallback: function that is called after success
     * @return boolean
     */
    @Override
    public boolean onQuery(CefBrowser browser, CefFrame frame, long queryId, String request, boolean persistent, CefQueryCallback callback) {
        System.out.println("Request: " + request); // For testing purposes
        switch (request) {
            // Add all queries that need to be handled
            case "buttonClicked" -> {
                System.out.println("Button Clicked!");
                return true;
            }
            case "refresh" -> {
                System.out.println("Refreshing!");
                // return JSON through parameter of success function
                callback.success("JSON");
                return true;
            }
            case "tangling" -> {
                // service.getTanglingMap();

                // TODO THESIS: HAnS-Viz should not start any background or modal task. Change this to only
                //  JSONHandler.getFeatureJSON(JSONHandler.JSONType.Tangling, service.getAllFeatureFileMappings(), service.getTanglingMap()).toJSONString()
                //  We maybe need to implement interface extension point HAnSCallback and give it to service
                new JSONHandler(project, JSONHandler.JSONType.Tangling, callback);
                return true;
                /*AtomicReference<String> result = new AtomicReference<>();
                ProgressManager.getInstance().run(new Task.Modal(ProjectManager.getInstance().getOpenProjects()[0], "Processing Features", false) {
                    @Override
                    public void run(@NotNull ProgressIndicator indicator) {
                        //TODO THESIS
                        // wrap in read action
                        result.set(JSONHandler.getFeatureJSON(JSONHandler.JSONType.Tangling, service.getAllFeatureFileMappings(), service.getTanglingMap()).toJSONString());

                    }
                });
                callback.success(result.get());
                return true;*/
            }
        }
        return false;
    }
}
