package se.isselab.hansviz.browser.jshandler;

import com.intellij.openapi.application.ApplicationManager;
import com.intellij.psi.PsiElement;
import se.isselab.HAnS.featureExtension.FeatureService;
import se.isselab.HAnS.featureModel.psi.FeatureModelFeature;
import se.isselab.HAnS.featureModel.FeatureModelUtil;
import com.intellij.openapi.application.ReadAction;

import se.isselab.hansviz.JSONHandler.JSONHandler;

import com.intellij.openapi.project.Project;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/*
Copyright 2024 David Stechow & Philipp Kusmierz

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

public class JSMessageRouterHandler extends CefMessageRouterHandlerAdapter {
    private final Project project;
    public JSMessageRouterHandler(Project project){
        this.project = project;
    }

    //private final FeatureService service = ProjectManager.getInstance().getOpenProjects()[0].getService(FeatureService.class);

    // &begin[Request]

    /**
     * Request on javascript side (that are called with window.java or window.javacancel are handeled here
     * @param browser CefBrowser
     * @param frame CefFrame
     * @param queryId long
     * @param request String: This request will be handled
     * @param persistent boolean
     * @param callback CefQueryCallback: function that is called after success
     * @return boolean
     */
    @Override
    public boolean onQuery(CefBrowser browser, CefFrame frame, long queryId, String request, boolean persistent, CefQueryCallback callback) {
        String[] requestTokens = request.split(",");
        switch (requestTokens[0]) {
            // Add all queries that need to be handled
            case "buttonClicked" -> {
                return true;
            }
            case "refresh" -> {
                // return JSON through parameter of success function
                callback.success("JSON");
                return true;
            }
            case "tangling" -> {

                // creates new JSONHandler for Tangling Graph
                new JSONHandler(project, JSONHandler.JSONType.Tangling, callback);
                return true;
            }
            case "tree" -> {
                new JSONHandler(project, JSONHandler.JSONType.Tree, callback);
                return true;
            }
            case "highlightFeature" -> {
                if(requestTokens.length < 2)
                    return false;

                FeatureService featureService = project.getService(FeatureService.class);
                if(featureService == null)
                    return false;

                featureService.highlightFeatureInFeatureModel(requestTokens[1]);
                callback.success("");

                return true;
            }
            case "openPath" -> {
                if(requestTokens.length < 2)
                    return false;
                FeatureService featureService = project.getService(FeatureService.class);
                if(featureService == null)
                    return false;
                if(requestTokens.length>=4){
                    featureService.openFileInProject(requestTokens[1], Integer.parseInt(requestTokens[2]), Integer.parseInt(requestTokens[3]));
                }
                else featureService.openFileInProject(requestTokens[1]);
                callback.success("");
                return true;
            }
            case "addFeature" -> {
                FeatureModelFeature parentFeature = getFeatureFromLPQ(requestTokens[1]);
                int result = parentFeature.addToFeatureModel(requestTokens[2]);

                if (result == -2) {
                    callback.failure(-2, "Feature with name " + requestTokens[2] + " is already child of " + requestTokens[1]);
                }
                if (result == -1) {
                    callback.failure(-1, "Feature name doesn't follow naming format.");
                }
                callback.success("JSON");
                return true;
            }
            case "deleteFeature" -> {
                FeatureModelFeature childFeature = getFeatureFromLPQ(requestTokens[1]);
                if (childFeature == null) { return false; }
                childFeature.deleteFeatureWithAnnotations();
                callback.success("JSON");
                return true;
            }
            case "dropFeature" -> {
                FeatureModelFeature childFeature = getFeatureFromLPQ(requestTokens[1]);
                if (childFeature == null) { return false; }

                try {
                    ApplicationManager.getApplication().invokeLater(() -> {
                        childFeature.deleteFeatureWithCode();
                    });
                } catch (Exception ignored) {}

                callback.success("JSON");
                return true;
            }
            case "moveFeature" -> {
                FeatureModelFeature childFeature = getFeatureFromLPQ(requestTokens[1]);
                FeatureModelFeature newParentFeature = getFeatureFromLPQ(requestTokens[2]);

                if (childFeature == null) { return false; }
                if (newParentFeature == null) { return false; }
                String parentLpq = requestTokens[2];
                String childLpq = requestTokens[1];
                int result = 1;
                // check that parentFeature isn't child of childFeature
                if (checkFeatureChildOfParent(childFeature, newParentFeature)) {
                    result = -1;
                    callback.failure(-1, "New parent feature " + parentLpq + " is child of " + childLpq);
                }

                for(PsiElement child : newParentFeature.getChildren()) {
                    // check that childFeature isn't already a direct child of parentFeature
                    // otherwise the operation is useless
                    if (child.equals(childFeature)) {
                        result = -2;
                        callback.failure(-2, "Child feature " + childLpq + " is already direct child of " + parentLpq);
                    }
                    // parent can't contain 2 child elements with same name
                    // -> you should rename child feature before moving
                    if (((FeatureModelFeature)child).getFeatureName().equals(childFeature.getFeatureName())) {
                        result = -3;
                        callback.failure(-3, "Parent " + parentLpq + " can't contain 2 child features with same LPQ " + childLpq);
                    }
                }
                if (result==1) {
                    newParentFeature.moveFeatureWithChildren(childFeature);
                }
                callback.success("JSON");
                return true;
            }
            case "renameFeature" -> {
                FeatureModelFeature childFeature = getFeatureFromLPQ(requestTokens[1]);
                String newFeatureName = requestTokens[2];
                if (childFeature == null) { return false; }

                int result = childFeature.renameInFeatureModel(newFeatureName);

                if (result == -1) {
                    callback.failure(-1, "Feature name doesn't follow the naming format.");
                }
                if (result == -2) {
                    callback.failure(-2, "Feature with name " + requestTokens[2] + " is already child of " + requestTokens[1]);
                }

                callback.success("JSON");
                return true;

            }
        }
        return false;
    }
    // &end[Request]

    private FeatureModelFeature getFeatureFromLPQ(String lpq) {
        List<FeatureModelFeature> listOfFeatures = ReadAction.compute(() -> FeatureModelUtil.findLPQ(project, lpq));
        if (listOfFeatures.isEmpty()) { return null; }
        FeatureModelFeature feature = (FeatureModelFeature) listOfFeatures.get(0);
        return feature;
    }

    private static boolean checkFeatureChildOfParent(FeatureModelFeature parentFeature, FeatureModelFeature childFeature) {
        if (parentFeature.equals(childFeature)) {
            return true; // Found the child feature at this level
        }

        // Check children recursively
        PsiElement[] children = parentFeature.getChildren();
        for (PsiElement child : children) {
            if (checkFeatureChildOfParent(((FeatureModelFeature) child), childFeature)) {
                return true; // Child feature found in one of the children
            }
        }

        return false; // Child feature not found in this subtree
    }
}
